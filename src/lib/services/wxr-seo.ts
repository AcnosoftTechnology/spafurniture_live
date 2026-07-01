/** Yoast SEO fields from WordPress postmeta. */
export type WxrSeoFields = {
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
};

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerptFromHtml(html: string, maxLen = 300): string {
  const text = stripHtml(html);
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trim()}…`;
}

function parseFocusKeywords(postmeta: Record<string, string>): string[] {
  const out: string[] = [];
  const primary = postmeta._yoast_wpseo_focuskw?.trim();
  if (primary) out.push(primary);

  const raw = postmeta._yoast_wpseo_focuskeywords?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          if (entry && typeof entry === "object" && "keyword" in entry) {
            const kw = String((entry as { keyword?: string }).keyword ?? "").trim();
            if (kw) out.push(kw);
          }
        }
      }
    } catch {
      /* ignore invalid JSON */
    }
  }

  return [...new Set(out)];
}

export function extractYoastSeo(
  postmeta: Record<string, string>,
  fallbackTitle: string,
): WxrSeoFields {
  const seoTitle = postmeta._yoast_wpseo_title?.trim() || fallbackTitle;
  const metaDescription = postmeta._yoast_wpseo_metadesc?.trim();
  const ogTitle = postmeta["_yoast_wpseo_opengraph-title"]?.trim() || seoTitle;
  const ogDescription =
    postmeta["_yoast_wpseo_opengraph-description"]?.trim() || metaDescription;

  return {
    seoTitle,
    metaDescription: metaDescription || undefined,
    keywords: parseFocusKeywords(postmeta),
    ogTitle,
    ogDescription: ogDescription || undefined,
  };
}
