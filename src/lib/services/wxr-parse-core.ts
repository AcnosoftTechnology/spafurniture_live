import { XMLParser } from "fast-xml-parser";
import type { ParseWxrOptions, WxrCategory, WxrItem } from "@/lib/services/wxr-types";

export function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function nodeText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("__cdata" in obj) return String(obj.__cdata ?? "").trim();
    if ("#text" in obj) return String(obj["#text"] ?? "").trim();
    if ("text" in obj) return String(obj.text ?? "").trim();
  }
  return "";
}

/**
 * WordPress WXR with removeNSPrefix merges content:encoded + excerpt:encoded into `encoded[]`.
 */
export function parseEncodedFields(item: Record<string, unknown>): {
  content: string;
  excerpt: string;
} {
  const enc = item.encoded;
  if (Array.isArray(enc)) {
    const blocks = enc.map((block) => nodeText(block));
    return { content: blocks[0] ?? "", excerpt: blocks[1] ?? "" };
  }

  if (enc != null) {
    const text = nodeText(enc);
    return { content: text, excerpt: "" };
  }

  let content = "";
  let excerpt = "";

  const contentNode = item.content;
  if (contentNode && typeof contentNode === "object") {
    content = nodeText((contentNode as Record<string, unknown>).encoded);
  }

  const excerptNode = item.excerpt;
  if (excerptNode && typeof excerptNode === "object") {
    excerpt = nodeText((excerptNode as Record<string, unknown>).encoded);
  }

  if (!content) {
    content = itemField(item, "encoded", "content:encoded", "content_encoded");
  }
  if (!excerpt) {
    excerpt = itemField(item, "excerpt:encoded", "excerpt_encoded");
  }

  return { content, excerpt };
}

export function itemField(item: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const text = nodeText(item[key]);
    if (text) return text;
  }

  const content = item.content;
  if (content && typeof content === "object") {
    const enc = nodeText((content as Record<string, unknown>).encoded);
    if (enc) return enc;
  }

  const excerpt = item.excerpt;
  if (excerpt && typeof excerpt === "object") {
    const enc = nodeText((excerpt as Record<string, unknown>).encoded);
    if (enc) return enc;
  }

  const encoded = item.encoded;
  if (encoded != null) {
    const text = nodeText(Array.isArray(encoded) ? encoded[0] : encoded);
    if (text) return text;
  }

  const wp = item.wp;
  if (wp && typeof wp === "object") {
    const wpObj = wp as Record<string, unknown>;
    for (const key of keys) {
      const bare = key.replace(/^wp:/, "");
      const text = nodeText(wpObj[bare]);
      if (text) return text;
    }
  }

  return "";
}

export function parsePostmeta(item: Record<string, unknown>): Record<string, string> {
  const meta: Record<string, string> = {};
  for (const block of asArray(item.postmeta)) {
    if (!block || typeof block !== "object") continue;
    const record = block as Record<string, unknown>;
    const key = itemField(record, "meta_key");
    const value = itemField(record, "meta_value");
    if (key) meta[key] = value;
  }
  return meta;
}

export function parseItemCategories(item: Record<string, unknown>): WxrCategory[] {
  const out: WxrCategory[] = [];
  for (const cat of asArray(item.category)) {
    if (!cat || typeof cat !== "object") continue;
    const record = cat as Record<string, unknown>;
    const name = nodeText(cat);
    if (!name) continue;
    out.push({
      domain: String(record["@_domain"] ?? record.domain ?? "category").toLowerCase(),
      name,
      nicename: String(record["@_nicename"] ?? record.nicename ?? "").toLowerCase(),
    });
  }
  return out;
}

export function parseWxrXml(xmlText: string, options: ParseWxrOptions = {}): WxrItem[] {
  const trimmed = xmlText.trim();
  if (!trimmed.startsWith("<")) {
    throw new Error("File is not valid XML.");
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true,
    removeNSPrefix: true,
    cdataPropName: "__cdata",
    isArray: (name) => name === "item" || name === "category" || name === "postmeta",
  });

  let parsed: unknown;
  try {
    parsed = parser.parse(trimmed);
  } catch {
    throw new Error("Could not parse XML.");
  }

  const channel = (parsed as Record<string, unknown>).rss as Record<string, unknown> | undefined;
  const channelData = channel?.channel as Record<string, unknown> | undefined;
  if (!channelData) {
    throw new Error("Invalid WordPress export: missing RSS channel.");
  }

  const items = asArray(channelData.item as Record<string, unknown> | Record<string, unknown>[]);
  const result: WxrItem[] = [];

  for (const item of items) {
    if (!item || typeof item !== "object") continue;

    const postType = itemField(item, "post_type", "wp:post_type").toLowerCase();
    if (options.postTypes?.length && !options.postTypes.includes(postType)) continue;
    if (options.excludePostTypes?.includes(postType)) continue;

    const title = itemField(item, "title");
    if (!title && postType !== "attachment") continue;

    const { content, excerpt } = parseEncodedFields(item);

    result.push({
      wpPostId: itemField(item, "post_id", "wp:post_id"),
      title,
      slug: itemField(item, "post_name", "wp:post_name"),
      postType,
      status: itemField(item, "status", "wp:status"),
      content,
      excerpt,
      date: itemField(item, "post_date", "wp:post_date", "pubDate"),
      creator: itemField(item, "creator", "dc:creator"),
      link: itemField(item, "link"),
      attachmentUrl: itemField(item, "attachment_url", "wp:attachment_url"),
      categories: parseItemCategories(item),
      postmeta: parsePostmeta(item),
      parentId: itemField(item, "post_parent", "wp:post_parent"),
    });
  }

  return result;
}

export function isWordPressExportXml(text: string): boolean {
  const t = text.trim().slice(0, 500).toLowerCase();
  return t.startsWith("<?xml") || t.startsWith("<rss") || t.includes("wordpress.org/export");
}
