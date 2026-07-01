import type { WxrItem } from "@/lib/services/wxr-types";
import { extractYoastSeo, excerptFromHtml } from "@/lib/services/wxr-seo";
import { rewriteContentUrls } from "@/lib/services/media-sideload.service";

export function wxrContentToStored(raw: string): string | undefined {
  if (!raw?.trim()) return undefined;
  const rewritten = rewriteContentUrls(raw.trim());
  return rewritten || undefined;
}

/** Body, excerpt, and Yoast SEO fields from a parsed WXR post item. */
export function buildBlogFieldsFromWxrItem(item: WxrItem) {
  const html = item.content?.trim() ?? "";
  const excerptText = item.excerpt?.trim() || excerptFromHtml(html);
  const seo = extractYoastSeo(item.postmeta, item.title.trim());
  const metaDescription = seo.metaDescription || excerptText || undefined;

  return {
    excerpt: excerptText || null,
    content: wxrContentToStored(html),
    seoTitle: seo.seoTitle || null,
    metaDescription: metaDescription || null,
    keywords: seo.keywords ?? [],
    ogTitle: seo.ogTitle || null,
    ogDescription: seo.ogDescription || metaDescription || null,
  };
}
