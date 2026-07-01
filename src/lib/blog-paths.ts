/**
 * Public blog URLs — match spafurniture.in:
 * Post: /{slug}/
 * Tag: /tag/{slug}/
 * Category: /category/{parent}/{child}/
 * Archive: /{year}/{month}/
 */

function withTrailingSlash(path: string): string {
  if (!path.endsWith("/")) return `${path}/`;
  return path;
}

export type BlogCategoryPathInput = {
  slug: string;
  name?: string;
  parent?: { slug: string; parent?: BlogCategoryPathInput | null } | null;
};

export function blogCategoryPathSegments(category: BlogCategoryPathInput): string[] {
  const segments: string[] = [];
  let current: BlogCategoryPathInput | null | undefined = category;
  while (current) {
    segments.unshift(current.slug);
    current = current.parent ?? null;
  }
  return segments;
}

/** e.g. /category/salon/pedicure-chair/ */
export function blogCategoryPath(category: BlogCategoryPathInput): string {
  const segments = blogCategoryPathSegments(category);
  return withTrailingSlash(`/category/${segments.join("/")}`);
}

/** e.g. /tag/ayurveda-table/ */
export function blogTagPath(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return withTrailingSlash(`/tag/${clean}`);
}

/** e.g. /modular-salon-furniture-design-trends/ */
export function blogPostPath(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return withTrailingSlash(`/${clean}`);
}

/** Main blog index (listing / search) */
export function blogIndexPath(): string {
  return "/blog/";
}
