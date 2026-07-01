import type { BlogCsvRow } from "@/lib/services/import.service";
import {
  isWordPressExportXml,
  itemField,
  parseItemCategories,
  parseWxrXml,
} from "@/lib/services/wxr-parse-core";

export { isWordPressExportXml, parseWxrXml } from "@/lib/services/wxr-parse-core";
export type { WxrItem, WxrCategory, ParseWxrOptions } from "@/lib/services/wxr-types";

const WXR_ROW_KEYS = {
  title: "Title",
  slug: "Slug",
  content: "Content",
  excerpt: "Excerpt",
  date: "Date",
  status: "Status",
  categories: "Categories",
  tags: "Tags",
} as const;

/**
 * Parse WordPress WXR export (.xml) into rows compatible with blog CSV import.
 * Only imports `post` type items.
 */
export function parseWordPressWxr(xmlText: string): BlogCsvRow[] {
  const items = parseWxrXml(xmlText, { postTypes: ["post"] });
  const rows: BlogCsvRow[] = [];

  for (const item of items) {
    const blogCats: string[] = [];
    const tags: string[] = [];
    for (const cat of item.categories) {
      if (cat.domain === "post_tag" || cat.domain === "tag") tags.push(cat.name);
      else if (cat.domain === "category") blogCats.push(cat.name);
    }

    rows.push({
      [WXR_ROW_KEYS.title]: item.title,
      [WXR_ROW_KEYS.slug]: item.slug,
      [WXR_ROW_KEYS.content]: item.content,
      [WXR_ROW_KEYS.excerpt]: item.excerpt,
      [WXR_ROW_KEYS.status]: item.status,
      [WXR_ROW_KEYS.date]: item.date,
      [WXR_ROW_KEYS.categories]: blogCats.join("|"),
      [WXR_ROW_KEYS.tags]: tags.join("|"),
    });
  }

  if (!rows.length) {
    throw new Error(
      "No blog posts found in this export. Export must include Posts (post_type=post).",
    );
  }

  return rows;
}

/** @deprecated use parseWxrXml — kept for legacy item iteration */
export function parseWordPressWxrItems(xmlText: string) {
  return parseWxrXml(xmlText);
}

export function defaultWxrColumnMapping(): Record<string, string> {
  return {
    title: WXR_ROW_KEYS.title,
    slug: WXR_ROW_KEYS.slug,
    content: WXR_ROW_KEYS.content,
    excerpt: WXR_ROW_KEYS.excerpt,
    date: WXR_ROW_KEYS.date,
    status: WXR_ROW_KEYS.status,
    categories: WXR_ROW_KEYS.categories,
    tags: WXR_ROW_KEYS.tags,
  };
}

// Re-export helpers used by tests
export { itemField, parseItemCategories };
