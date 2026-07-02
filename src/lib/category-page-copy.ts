import { prisma } from "@/lib/prisma";
import { rewriteContentUrls } from "@/lib/services/media-sideload.service";
import { sanitizeRichHtml } from "@/lib/sanitize-html";

/** WP page slugs that map to a product category slug (nav vs legacy names). */
const CATEGORY_PAGE_SLUGS: Record<string, string[]> = {
  "massage-tables": ["massage-beds", "massage-tables"],
  "massage-beds": ["massage-beds", "massage-tables"],
  loungers: ["spa-relaxation-loungers", "loungers"],
  accessories: ["spa-accessories", "accessories"],
  "spa-carts": ["spa-carts"],
  "spa-stools": ["spa-stools"],
  "pedicure-manicure": ["pedicure-manicure"],
  "salon-furniture": ["salon-furniture"],
  "spa-trolleys": ["spa-trolleys"],
};

function stripWpShortcodes(raw: string): string {
  let cur = raw;
  let prev = "";
  while (cur !== prev) {
    prev = cur;
    cur = cur.replace(/\[(?:\/)?vc_[^\]]*\]/gi, "");
    cur = cur.replace(/\[(?:\/)?ess_grid[^\]]*\]/gi, "");
    cur = cur.replace(
      /\[(?:\/)?vc_raw_(?:html|js)[^\]]*\](?:[\s\S]*?)\[\/vc_raw_(?:html|js)\]/gi,
      "",
    );
    cur = cur.replace(/\[[^\]]+\]/g, "");
  }
  return cur;
}

/** Pulls the SEO copy block from a WP Visual Composer category page export. */
/** Category SEO copy must not add a second page-level h1 (Safari Reader + a11y). */
export function normalizeCategoryCopyHtml(html: string): string {
  let out = html
    .replace(/<\/?html[^>]*>/gi, "")
    .replace(/<\/?body[^>]*>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "");

  out = out.replace(/<h1(\s[^>]*)?>/i, '<h2 class="esth-products-copy-lead"$1>');
  out = out.replace(/<h1(\s[^>]*)?>/gi, "<h2$1>");
  out = out.replace(/<\/h1>/gi, "</h2>");

  return out.trim();
}

export function extractCategorySeoHtml(raw: string): string | null {
  if (!raw?.trim()) return null;

  const sectionMatch = raw.match(
    /el_class="section-div-p"[^\]]*\]([\s\S]*?)(?:\[\/vc_column_text\]|$)/i,
  );
  if (sectionMatch?.[1]?.trim()) {
    return rewriteContentUrls(stripWpShortcodes(sectionMatch[1].trim()));
  }

  const stripped = stripWpShortcodes(raw);
  const h1Match = stripped.match(/<h1[\s\S]*/i);
  if (h1Match?.[0]?.trim()) {
    return rewriteContentUrls(h1Match[0].trim());
  }

  const textOnly = stripped.replace(/<[^>]+>/g, "").trim();
  if (textOnly.length > 120) {
    return rewriteContentUrls(stripped.trim());
  }

  return null;
}

export function pageSlugsForCategory(categorySlug: string): string[] {
  const aliases = CATEGORY_PAGE_SLUGS[categorySlug];
  if (aliases) return aliases;
  return [categorySlug];
}

export type LinkedPageSeo = {
  seoTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
};

/** Yoast SEO from a linked WP page (e.g. massage-beds → massage-tables). */
export async function getLinkedPageSeoForCategory(
  categorySlug: string,
): Promise<LinkedPageSeo | null> {
  for (const pageSlug of pageSlugsForCategory(categorySlug)) {
    const page = await prisma.page.findFirst({
      where: { slug: pageSlug, status: "PUBLISHED" },
      select: {
        seoTitle: true,
        metaDescription: true,
        keywords: true,
        canonicalUrl: true,
        ogTitle: true,
        ogDescription: true,
      },
    });
    if (!page) continue;
    if (page.seoTitle?.trim() || page.metaDescription?.trim()) {
      return page;
    }
  }
  return null;
}

export async function getCategoryCopyHtml(
  categorySlug: string,
  category?: { description?: string | null; pageContent?: unknown } | null,
): Promise<string | null> {
  const finalize = (html: string) => sanitizeRichHtml(normalizeCategoryCopyHtml(html));

  if (category?.description?.trim()) {
    return finalize(category.description.trim());
  }

  if (typeof category?.pageContent === "string" && category.pageContent.trim()) {
    const extracted = extractCategorySeoHtml(category.pageContent);
    if (extracted) return finalize(extracted);
  }

  for (const pageSlug of pageSlugsForCategory(categorySlug)) {
    const page = await prisma.page.findFirst({
      where: { slug: pageSlug, status: "PUBLISHED" },
      select: { content: true },
    });
    if (!page?.content) continue;

    const raw =
      typeof page.content === "string"
        ? page.content
        : typeof page.content === "object" &&
            page.content !== null &&
            "html" in page.content &&
            typeof (page.content as { html: unknown }).html === "string"
          ? (page.content as { html: string }).html
          : null;

    if (!raw) continue;

    const extracted = extractCategorySeoHtml(raw);
    if (extracted) return finalize(extracted);
  }

  return null;
}
