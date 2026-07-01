export type BlogViewMode = "list" | "grid";

export const BLOG_VIEW_STORAGE_KEY = "esth-blog-view";

export const DEFAULT_BLOG_VIEW: BlogViewMode = "list";

export function isBlogViewMode(value: string | null): value is BlogViewMode {
  return value === "list" || value === "grid";
}
