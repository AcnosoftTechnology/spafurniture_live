import { prisma } from "@/lib/prisma";
import type { SitemapGenerateResult } from "./types";

export const SITEMAP_META_KEY = "sitemap_meta";

export type SitemapMeta = SitemapGenerateResult;

export async function getSitemapMeta(): Promise<SitemapMeta | null> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: SITEMAP_META_KEY } });
    if (!row?.value || typeof row.value !== "object") return null;
    const raw = row.value as Record<string, unknown>;
    if (typeof raw.generatedAt !== "string") return null;
    const counts = raw.counts as SitemapMeta["counts"] | undefined;
    if (!counts || typeof counts.posts !== "number") return null;
    return {
      generatedAt: raw.generatedAt,
      counts,
      files: Array.isArray(raw.files) ? (raw.files as string[]) : [],
    };
  } catch {
    return null;
  }
}

export async function saveSitemapMeta(meta: SitemapMeta): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: SITEMAP_META_KEY },
    update: { value: meta },
    create: { key: SITEMAP_META_KEY, value: meta },
  });
}
