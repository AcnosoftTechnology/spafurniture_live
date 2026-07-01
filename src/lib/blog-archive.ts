import { format } from "date-fns";

/** Archive key used in queries, e.g. `2025-11` */
export type BlogArchiveKey = `${number}-${string}`;

export function isValidArchiveYearMonth(year: number, month: number): boolean {
  return Number.isInteger(year) && year >= 2000 && year <= 2100 && Number.isInteger(month) && month >= 1 && month <= 12;
}

export function archiveKeyFromParts(year: number, month: number): string | null {
  if (!isValidArchiveYearMonth(year, month)) return null;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseArchiveRouteParams(yearRaw: string, monthRaw: string): { year: number; month: number; key: string } | null {
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const key = archiveKeyFromParts(year, month);
  if (!key) return null;
  return { year, month, key };
}

/** Public monthly archive URL, e.g. /2025/11/ */
export function blogArchivePath(year: number, month: number): string {
  const key = archiveKeyFromParts(year, month);
  if (!key) throw new Error("Invalid archive date");
  const [, m] = key.split("-");
  return `/${year}/${m}/`;
}

export function blogArchivePathFromKey(key: string): string | null {
  const match = /^(\d{4})-(\d{2})$/.exec(key.trim());
  if (!match) return null;
  return blogArchivePath(Number(match[1]), Number(match[2]));
}

export function blogArchiveLabel(year: number, month: number): string {
  return format(new Date(year, month - 1, 1), "MMMM yyyy");
}

export function archiveKeyFromDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

