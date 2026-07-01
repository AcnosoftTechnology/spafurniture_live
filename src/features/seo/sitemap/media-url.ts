import { mediaUrl } from "@/lib/utils";

export type MediaRef = {
  path: string;
  cdnUrl?: string | null;
} | null;

export function mediaAbsoluteUrl(baseUrl: string, media: MediaRef): string | null {
  if (!media?.path?.trim() && !media?.cdnUrl?.trim()) return null;
  if (media.cdnUrl?.trim()) return media.cdnUrl.trim();
  const rel = mediaUrl(media.path);
  if (rel.startsWith("http://") || rel.startsWith("https://")) return rel;
  return `${baseUrl}${rel}`;
}

export function uniqueUrls(urls: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const url of urls) {
    if (!url?.trim() || seen.has(url)) continue;
    seen.add(url);
    result.push(url);
  }
  return result;
}
