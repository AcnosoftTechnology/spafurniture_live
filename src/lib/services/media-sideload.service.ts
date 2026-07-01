import { promises as fs } from "fs";
import path from "path";
import { parseWxrXml } from "@/lib/services/wxr-parse-core";
import { uploadMedia } from "@/lib/services/media.service";

const DEFAULT_BASE = "https://www.spafurniture.in";
const SPADATA_DIR = path.join(process.cwd(), "spadata");

/** In-memory cache: WP attachment URL or post ID → local Media id */
const urlToMediaId = new Map<string, string>();
const wpIdToMediaId = new Map<string, string>();
/** Original WP uploads URL → public path `/uploads/{filename}` */
const urlToPublicPath = new Map<string, string>();

export function getMediaIdForWpPost(wpPostId: string): string | undefined {
  return wpIdToMediaId.get(String(wpPostId));
}

export function rememberMediaMapping(
  wpPostId: string,
  mediaId: string,
  sourceUrl?: string,
  publicPath?: string,
) {
  wpIdToMediaId.set(String(wpPostId), mediaId);
  if (sourceUrl) {
    urlToMediaId.set(sourceUrl, mediaId);
    if (publicPath) urlToPublicPath.set(sourceUrl, publicPath);
  }
}

export function clearMediaImportCache() {
  urlToMediaId.clear();
  wpIdToMediaId.clear();
  urlToPublicPath.clear();
  attachmentUrlIndex = null;
  attachmentIndexPromise = null;
}

/** WP attachment post ID → source URL (from spadata XML, no download). */
let attachmentUrlIndex: Map<string, string> | null = null;
let attachmentIndexPromise: Promise<Map<string, string>> | null = null;

async function readSpadataXml(name: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(SPADATA_DIR, name), "utf8");
  } catch {
    return null;
  }
}

function ingestAttachmentsIntoIndex(xml: string, index: Map<string, string>) {
  const items = parseWxrXml(xml, { postTypes: ["attachment"] });
  for (const item of items) {
    const url = item.attachmentUrl || item.link;
    if (item.wpPostId && url?.trim()) {
      index.set(String(item.wpPostId), url.trim());
    }
  }
}

/** Build index from media.xml + embedded attachments in products.xml. */
export async function ensureAttachmentUrlIndex(): Promise<Map<string, string>> {
  if (attachmentUrlIndex) return attachmentUrlIndex;
  if (attachmentIndexPromise) return attachmentIndexPromise;

  attachmentIndexPromise = (async () => {
    const index = new Map<string, string>();
    const mediaXml = await readSpadataXml("media.xml");
    const productsXml = await readSpadataXml("products.xml");
    if (mediaXml) ingestAttachmentsIntoIndex(mediaXml, index);
    if (productsXml) ingestAttachmentsIntoIndex(productsXml, index);
    attachmentUrlIndex = index;
    return index;
  })();

  return attachmentIndexPromise;
}

/**
 * Resolve WordPress attachment ID to local Media id.
 * Uses in-memory cache from current import run, or downloads on demand from spadata XML.
 */
export async function resolveWpMediaId(
  wpPostId: string | undefined,
  userId?: string,
): Promise<string | undefined> {
  const id = wpPostId?.trim();
  if (!id) return undefined;

  const cached = getMediaIdForWpPost(id);
  if (cached) return cached;

  const index = await ensureAttachmentUrlIndex();
  const url = index.get(id);
  if (!url) return undefined;

  const mediaId = await sideloadMediaFromUrl(url, userId, id);
  return mediaId ?? undefined;
}

function guessFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split("/").pop() || "image.jpg";
    return base.includes(".") ? base : `${base}.jpg`;
  } catch {
    return "imported-image.jpg";
  }
}

function guessMime(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    avif: "image/avif",
    svg: "image/svg+xml",
  };
  return map[ext] ?? "image/jpeg";
}

/**
 * Download image from WordPress uploads URL and store in local Media library.
 */
export async function sideloadMediaFromUrl(
  url: string,
  userId?: string,
  wpPostId?: string,
): Promise<string | null> {
  const normalized = url.trim();
  if (!normalized) return null;

  if (urlToMediaId.has(normalized)) {
    return urlToMediaId.get(normalized)!;
  }

  if (wpPostId && wpIdToMediaId.has(wpPostId)) {
    return wpIdToMediaId.get(wpPostId)!;
  }

  let fetchUrl = normalized;
  if (fetchUrl.startsWith("/")) {
    fetchUrl = `${DEFAULT_BASE}${fetchUrl}`;
  }

  try {
    const res = await fetch(fetchUrl, {
      signal: AbortSignal.timeout(60_000),
      headers: { "User-Agent": "SpafurImporter/1.0" },
    });
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 32) return null;

    const filename = guessFilename(fetchUrl);
    const mime = res.headers.get("content-type")?.split(";")[0]?.trim() || guessMime(filename);
    const file = new File([new Uint8Array(buffer)], filename, { type: mime });
    const media = await uploadMedia(file, userId);
    const publicPath = `/uploads/${media.path}`;

    if (wpPostId) rememberMediaMapping(wpPostId, media.id, normalized, publicPath);
    urlToMediaId.set(normalized, media.id);
    urlToPublicPath.set(normalized, publicPath);

    return media.id;
  } catch {
    return null;
  }
}

export function rewriteContentUrls(html: string, baseUrl = DEFAULT_BASE): string {
  if (!html) return html;
  let out = html;

  for (const [oldUrl, newPath] of urlToPublicPath) {
    out = out.split(oldUrl).join(newPath);
  }

  const uploadsPattern = new RegExp(
    `${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/wp-content/uploads/([^"'\\s>]+)`,
    "gi",
  );
  out = out.replace(uploadsPattern, "/uploads/wp-legacy/$1");

  return out;
}
