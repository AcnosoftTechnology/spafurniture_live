import type { WxrItem } from "@/lib/services/wxr-types";
import { excerptFromHtml, extractYoastSeo, stripHtml } from "@/lib/services/wxr-seo";
import { rewriteContentUrls } from "@/lib/services/media-sideload.service";

function pickNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

function normalizeHtmlContent(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  return rewriteContentUrls(raw.trim());
}

function linesFromRaw(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return stripHtml(raw)
    .split(/\r?\n|[•·]/g)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function parseDimensionMap(raw: string | undefined): string {
  const lines = linesFromRaw(raw);
  if (!lines.length) return "";
  return lines.join("\n");
}

function parseFeatureRows(raw: string | undefined): Array<{ label: string; value: string }> {
  const lines = linesFromRaw(raw);
  const seen = new Set<string>();
  const out: Array<{ label: string; value: string }> = [];

  for (const line of lines) {
    const normalized = line.replace(/\s+/g, " ").trim();
    if (!normalized || seen.has(normalized.toLowerCase())) continue;
    seen.add(normalized.toLowerCase());
    out.push({ label: normalized, value: "" });
  }

  return out;
}

export function buildProductFieldsFromWxrItem(item: WxrItem) {
  const htmlDescription = pickNonEmpty(item.content, item.postmeta["wolfe_portfolio-description"]);
  const htmlFeatureSource = pickNonEmpty(item.postmeta["wolfe_portfolio-dimension"]);
  const rawDimensions = pickNonEmpty(item.postmeta["wolfe_portfolio-custom"]);

  const shortDescSource = pickNonEmpty(item.excerpt, item.postmeta["wolfe_portfolio-description"]);
  const shortDesc = shortDescSource
    ? excerptFromHtml(shortDescSource, 350)
    : undefined;

  const seo = extractYoastSeo(item.postmeta, item.title.trim());
  const metaDescription = seo.metaDescription || shortDesc || undefined;

  return {
    shortDesc,
    fullDesc: normalizeHtmlContent(htmlDescription),
    dimensions: parseDimensionMap(rawDimensions) || undefined,
    features: parseFeatureRows(htmlFeatureSource),
    priceDisplay: item.postmeta["eg-pricetable-price"]?.trim() || undefined,
    seoTitle: seo.seoTitle || undefined,
    metaDescription,
    keywords: seo.keywords ?? [],
    ogTitle: seo.ogTitle || undefined,
    ogDescription: seo.ogDescription || metaDescription || undefined,
  };
}

/** Parse WordPress serialized ID list e.g. products_images `a:5:{i:0;s:4:"7221";...}` */
export function parsePhpSerializedIdList(value: string): string[] {
  const ids: string[] = [];
  for (const match of value.matchAll(/s:\d+:"(\d+)"/g)) {
    ids.push(match[1]);
  }
  return ids;
}

/** Featured + gallery attachment IDs from product postmeta. */
export function parseProductGalleryWpIds(postmeta: Record<string, string>): string[] {
  const ordered: string[] = [];
  const thumb = postmeta._thumbnail_id?.trim();
  if (thumb) ordered.push(thumb);

  const galleryRaw = postmeta.products_images?.trim();
  if (galleryRaw) {
    ordered.push(...parsePhpSerializedIdList(galleryRaw));
  }

  const egImage = postmeta.eg_sources_image?.trim();
  if (egImage && /^\d+$/.test(egImage)) ordered.push(egImage);

  return [...new Set(ordered)];
}
