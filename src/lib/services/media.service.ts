import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { ensurePublicUploadsDir, resolveUploadFilename } from "@/lib/server-paths";

import {
  ALLOWED_MEDIA_MIME,
  MAX_MEDIA_UPLOAD_BYTES,
  MAX_MEDIA_UPLOAD_MB,
  MEDIA_EXT_TO_MIME,
  SUPPORTED_MEDIA_FORMATS,
} from "@/lib/media-types";

const EXT_TO_MIME = MEDIA_EXT_TO_MIME;

function resolveMimeType(file: File): string {
  const ext = path.extname(file.name).toLowerCase();
  const fromExt = EXT_TO_MIME[ext];
  if (fromExt) return fromExt;

  const type = file.type?.toLowerCase();
  if (type && ALLOWED_MEDIA_MIME.has(type)) return type;
  if (type === "image/jpg") return "image/jpeg";
  if (type === "image/vnd.microsoft.icon") return "image/x-icon";

  throw new AppError(
    "INVALID_FILE",
    `Unsupported image format. Supported: ${SUPPORTED_MEDIA_FORMATS}.`,
    400,
  );
}

function extensionForFile(file: File, mime: string): string {
  const fromName = path.extname(file.name).toLowerCase().slice(1);
  if (fromName && EXT_TO_MIME[`.${fromName}`]) return fromName;

  switch (mime) {
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "image/svg+xml":
      return "svg";
    case "image/bmp":
      return "bmp";
    case "image/tiff":
      return "tiff";
    case "image/x-icon":
      return "ico";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    case "application/pdf":
      return "pdf";
    default:
      return "jpg";
  }
}

async function processPdf(buffer: Buffer, filepath: string) {
  await fs.writeFile(filepath, buffer);
  return { width: null, height: null, webpPath: null };
}

function sharpInput(buffer: Buffer, mime: string) {
  return mime === "image/svg+xml" ? sharp(buffer, { density: 300 }) : sharp(buffer);
}

async function tryGenerateWebpPreview(
  buffer: Buffer,
  mime: string,
  webpFilepath: string,
): Promise<boolean> {
  try {
    await sharpInput(buffer, mime).webp({ quality: 85 }).toFile(webpFilepath);
    return true;
  } catch {
    return false;
  }
}

async function processImage(
  buffer: Buffer,
  mime: string,
  filepath: string,
  webpFilepath: string,
): Promise<{ width: number | null; height: number | null; webpPath: string | null }> {
  if (mime === "image/svg+xml") {
    await fs.writeFile(filepath, buffer);
    const previewCreated = await tryGenerateWebpPreview(buffer, mime, webpFilepath);
    let width: number | null = null;
    let height: number | null = null;
    if (previewCreated) {
      try {
        const meta = await sharpInput(buffer, mime).metadata();
        width = meta.width ?? null;
        height = meta.height ?? null;
      } catch {
        /* optional metadata */
      }
    }
    return { width, height, webpPath: previewCreated ? path.basename(webpFilepath) : null };
  }

  // Sharp flattens animated GIFs to a single frame — keep original bytes for animation.
  if (mime === "image/gif") {
    await fs.writeFile(filepath, buffer);
    let width: number | null = null;
    let height: number | null = null;
    try {
      const meta = await sharp(buffer).metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
    } catch {
      /* optional metadata */
    }
    const previewCreated = await tryGenerateWebpPreview(buffer, mime, webpFilepath);
    return {
      width,
      height,
      webpPath: previewCreated ? path.basename(webpFilepath) : null,
    };
  }

  const image = sharpInput(buffer, mime);

  try {
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new AppError("INVALID_FILE", "Invalid or corrupted image file", 400);
    }

    await image.toFile(filepath);

    if (mime === "image/webp") {
      return { width: metadata.width, height: metadata.height, webpPath: path.basename(filepath) };
    }

    const previewCreated = await tryGenerateWebpPreview(buffer, mime, webpFilepath);
    return {
      width: metadata.width,
      height: metadata.height,
      webpPath: previewCreated ? path.basename(webpFilepath) : null,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    // Keep original bytes when sharp cannot decode (e.g. HEIC on some Windows builds).
    await fs.writeFile(filepath, buffer);
    const previewCreated = await tryGenerateWebpPreview(buffer, mime, webpFilepath);
    return { width: null, height: null, webpPath: previewCreated ? path.basename(webpFilepath) : null };
  }
}

export async function ensureUploadDir() {
  const dir = path.resolve(env.UPLOAD_DIR);
  await fs.mkdir(dir, { recursive: true });
  await ensurePublicUploadsDir();
  return dir;
}

export async function uploadMedia(file: File, userId?: string, folderId?: string) {
  const mime = resolveMimeType(file);

  if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
    throw new AppError("FILE_TOO_LARGE", `File exceeds ${MAX_MEDIA_UPLOAD_MB}MB limit`, 400);
  }

  await ensureUploadDir();
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extensionForFile(file, mime);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filepath = resolveUploadFilename(filename);
  const webpName = filename.replace(/\.[^.]+$/, ".webp");
  const webpFilepath = resolveUploadFilename(webpName);

  let result: { width: number | null; height: number | null; webpPath: string | null };
  try {
    if (mime === "application/pdf") {
      result = await processPdf(buffer, filepath);
    } else {
      result = await processImage(buffer, mime, filepath, webpFilepath);
    }
  } catch (error) {
    await fs.unlink(filepath).catch(() => undefined);
    await fs.unlink(webpFilepath).catch(() => undefined);
    if (error instanceof AppError) throw error;
    throw new AppError(
      "PROCESSING_FAILED",
      error instanceof Error ? error.message : "Could not process file",
      400,
    );
  }

  return prisma.media.create({
    data: {
      filename: file.name,
      path: filename,
      webpPath: result.webpPath,
      mime,
      size: file.size,
      width: result.width,
      height: result.height,
      folderId,
      uploadedById: userId,
    },
  });
}

export async function listMedia(params?: { folderId?: string | null; search?: string }) {
  return prisma.media.findMany({
    where: {
      folderId: params?.folderId ?? undefined,
      OR: params?.search
        ? [{ filename: { contains: params.search, mode: "insensitive" } }, { alt: { contains: params.search, mode: "insensitive" } }]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { folder: true },
  });
}

export async function listFolders() {
  return prisma.mediaFolder.findMany({
    include: { _count: { select: { media: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createFolder(name: string, parentId?: string) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return prisma.mediaFolder.create({ data: { name, slug, parentId } });
}
