/** Decode common HTML entities from WordPress exports (e.g. &#038; → &). */
export function decodeHtmlEntities(text: string): string {
  if (!text) return text;

  let out = text
    .replace(/&#0*38;/gi, "&")
    .replace(/&#x0*26;/gi, "&")
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

  // Numeric decimal entities
  out = out.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

  return out.trim();
}
