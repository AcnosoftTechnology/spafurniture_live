import { format, isValid } from "date-fns";

/** e.g. "27TH MAY 2026" */
export function formatBlogHeroDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (!isValid(date)) return "";
  return format(date, "do MMMM yyyy").toUpperCase();
}

export function resolveBlogAuthorDisplayName(
  authorDisplayName: string | null | undefined,
  linkedAuthorName: string | null | undefined,
): string {
  const wp = authorDisplayName?.trim();
  if (wp) return wp;

  const linked = linkedAuthorName?.trim() ?? "";
  if (!linked || /^super\s*admin$/i.test(linked)) return "Esthetica";
  return linked;
}

export function formatBlogHeroAuthor(name: string): string {
  return name.trim().toUpperCase();
}

export function buildBlogHeroMetaLine(publishedAt: Date | string | null | undefined, authorName: string): string {
  const datePart = formatBlogHeroDate(publishedAt);
  const authorPart = authorName.trim() ? `BY: ${formatBlogHeroAuthor(authorName)}` : "";
  return [datePart, authorPart].filter(Boolean).join(" | ");
}
