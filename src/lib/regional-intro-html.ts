import { parseRegionalGridShortcodes } from "@/lib/regional-grid-shortcodes";
import { sanitizeRegionalIntroHtml } from "@/lib/sanitize-html";

export function prepareRegionalIntroHtml(html: string): string {
  return sanitizeRegionalIntroHtml(parseRegionalGridShortcodes(html));
}
