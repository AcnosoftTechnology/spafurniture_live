import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { resolvePublicUrlPath } from "@/lib/server-paths";
import { getSiteConfig } from "@/lib/site-settings";
import { getBaseUrl, mediaUrl } from "@/lib/utils";

export function faviconMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".ico":
      return "image/x-icon";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    default:
      return "image/png";
  }
}

export function faviconPublicHref(faviconPath: string): string {
  const version = encodeURIComponent(faviconPath);
  return `/favicon.ico?v=${version}`;
}

export function buildFaviconMetadata(faviconPath?: string | null): Metadata["icons"] | undefined {
  if (!faviconPath?.trim()) return undefined;

  const href = `${getBaseUrl()}${faviconPublicHref(faviconPath)}`;
  const type = faviconMimeType(faviconPath);

  return {
    icon: [{ url: href, type }],
    shortcut: [{ url: href, type }],
    apple: [{ url: href, type }],
  };
}

export async function getSiteFaviconMetadata(): Promise<Metadata["icons"] | undefined> {
  const site = await getSiteConfig();
  return buildFaviconMetadata(site.branding.faviconPath);
}

export async function readFaviconFile(faviconPath: string) {
  const publicPath = mediaUrl(faviconPath);
  const diskPath = resolvePublicUrlPath(publicPath);
  const buffer = await readFile(diskPath);
  return {
    buffer,
    contentType: faviconMimeType(diskPath),
  };
}
