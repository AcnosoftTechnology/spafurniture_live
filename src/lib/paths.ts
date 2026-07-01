/**
 * Public URL paths — match legacy spafurniture.in structure.
 * Products: https://www.spafurniture.in/products/{slug}/
 * Categories: https://www.spafurniture.in/{category-slug}/
 */

import { blogArchivePath } from "@/lib/blog-archive";

export { blogPostPath, blogTagPath, blogCategoryPath, blogIndexPath } from "@/lib/blog-paths";
import { getBaseUrl } from "@/lib/utils";

function withTrailingSlash(path: string): string {
  if (!path.endsWith("/")) return `${path}/`;
  return path;
}

/** Product detail page, e.g. /products/wooden-shirodhara-stand/ */
export function productPath(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return withTrailingSlash(`/products/${clean}`);
}

/** Category listing page, e.g. /massage-beds/ */
export function categoryPath(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return withTrailingSlash(`/${clean}`);
}

export function productCanonicalUrl(slug: string): string {
  return `${getBaseUrl()}${productPath(slug)}`;
}

export function categoryCanonicalUrl(slug: string): string {
  return `${getBaseUrl()}${categoryPath(slug)}`;
}

/** Monthly blog archive, e.g. /2025/11/ */
export { blogArchivePath as blogArchivePathFromYearMonth };

/** Public URL for a CMS page (about, imported category pages, etc.) */
export function pagePath(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  if (clean === "home") return withTrailingSlash("/");
  if (clean === "about" || clean === "about-us") return withTrailingSlash(`/${clean}`);
  if (clean === "clients") return withTrailingSlash("/clients");
  if (clean === "brochure") return withTrailingSlash("/brochure");
  return categoryPath(clean);
}

export function pageCanonicalUrl(slug: string): string {
  return `${getBaseUrl()}${pagePath(slug)}`;
}
