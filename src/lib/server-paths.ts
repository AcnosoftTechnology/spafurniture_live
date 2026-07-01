import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

/** Resolved at runtime only — avoids Turbopack tracing the whole `public/` tree at build time. */
export function getPublicDir(): string {
  return path.normalize(`${process.cwd()}${path.sep}public`);
}

export function getPublicUploadsDir(): string {
  return path.normalize(`${getPublicDir()}${path.sep}uploads`);
}

/** Write a single file in the site `public/` root (e.g. sitemap XML). */
export async function writePublicRootFile(filename: string, content: string): Promise<void> {
  const safeName = path.basename(filename);
  if (!safeName || safeName !== filename || safeName.includes("..")) {
    throw new Error("Invalid public filename");
  }

  const root = getPublicDir();
  const filepath = path.normalize(`${root}${path.sep}${safeName}`);
  const normalizedRoot = `${path.normalize(root)}${path.sep}`;
  if (!filepath.startsWith(normalizedRoot)) {
    throw new Error("Invalid public filename");
  }

  await writeFile(filepath, content, "utf8");
}

export async function ensurePublicUploadsDir(): Promise<void> {
  await mkdir(getPublicUploadsDir(), { recursive: true });
}

/** Safe path under `public/` for a site-relative URL (e.g. `/assets/...`). */
export function resolvePublicUrlPath(urlPath: string): string {
  const relative = urlPath.replace(/^\/+/, "").replace(/\\/g, "/");
  const segments = relative.split("/").filter((part) => part && part !== "." && part !== "..");
  if (!segments.length) {
    throw new Error("Invalid public path");
  }

  const root = getPublicDir();
  let absolute = root;
  for (const segment of segments) {
    absolute = path.normalize(`${absolute}${path.sep}${segment}`);
  }

  const normalizedRoot = `${path.normalize(root)}${path.sep}`;
  if (!absolute.startsWith(normalizedRoot)) {
    throw new Error("Invalid public path");
  }
  return absolute;
}

/** Safe upload filename → disk path under the configured upload directory. */
export function resolveUploadFilename(filename: string): string {
  const safeName = path.basename(filename);
  if (!safeName || safeName !== filename || safeName.includes("..")) {
    throw new Error("Invalid upload filename");
  }

  const uploadDir = path.resolve(env.UPLOAD_DIR);
  const uploadsDir = getPublicUploadsDir();
  const normalizedUploads = `${path.normalize(uploadsDir)}${path.sep}`;

  if (uploadDir === uploadsDir || uploadDir.startsWith(normalizedUploads)) {
    return path.normalize(`${uploadsDir}${path.sep}${safeName}`);
  }

  return path.resolve(uploadDir, safeName);
}
