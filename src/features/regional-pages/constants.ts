export const REGIONAL_PAGE_TEMPLATE = "REGIONAL";

export function regionalSettingKey(slug: string) {
  return `regional-page:${slug}`;
}

/** Published regional landing URLs (extend when adding regions in admin). */
export const KNOWN_REGIONAL_SLUGS = ["uae", "saudi-arabia", "qatar"] as const;

export function isKnownRegionalSlug(slug: string) {
  const normalized = slug.trim().toLowerCase();
  return (KNOWN_REGIONAL_SLUGS as readonly string[]).includes(normalized);
}

/** Slugs that must never become a regional landing URL. */
export const REGIONAL_SLUG_BLOCKLIST = [
  "products",
  "blog",
  "about",
  "about-us",
  "clients",
  "brochure",
  "shows-and-exhibitions",
  "contact-us",
  "international-distributors",
  "admin",
  "api",
  "thank-you",
  "tag",
  "category",
  "sitemap.xml",
  "sitemap_index.xml",
  "post-sitemap.xml",
  "page-sitemap.xml",
  "products-sitemap.xml",
  "sitemap.xsl",
  "regional-pages",
] as const;
