import { decodeHtmlEntities } from "@/lib/html-entities";

/** Seed / migration reference — not injected into the live tab bar. */
export const DEFAULT_PRODUCT_NAV_CATEGORIES = [
  { title: "Massage Tables", slug: "massage-tables", sortOrder: 1 },
  { title: "Pedicure & Manicure", slug: "pedicure-manicure", sortOrder: 2 },
  { title: "Spa Stools", slug: "spa-stools", sortOrder: 3 },
  { title: "Spa Carts", slug: "spa-carts", sortOrder: 4 },
  { title: "Loungers", slug: "loungers", sortOrder: 5 },
  { title: "Salon Furniture", slug: "salon-furniture", sortOrder: 6 },
  { title: "Accessories", slug: "accessories", sortOrder: 7 },
] as const;

export type ProductNavCategoryItem = {
  title: string;
  slug: string;
};

function navDisplayTitle(cat: { title: string; menuLabel?: string | null }): string {
  const label = cat.menuLabel?.trim();
  return decodeHtmlEntities(label || cat.title);
}

/** Published categories flagged for the products/category tab bar. */
export function buildProductNavCategories(
  dbCategories: {
    title: string;
    slug: string;
    sortOrder?: number;
    menuLabel?: string | null;
    homepageFeatured?: boolean;
    homepageFeaturedSortOrder?: number;
  }[],
): ProductNavCategoryItem[] {
  function navSortKey(cat: {
    sortOrder?: number;
    homepageFeatured?: boolean;
    homepageFeaturedSortOrder?: number;
  }): number {
    if (cat.homepageFeatured) return cat.homepageFeaturedSortOrder ?? 0;
    return 1000 + (cat.sortOrder ?? 0);
  }

  return [...dbCategories]
    .sort(
      (a, b) =>
        navSortKey(a) - navSortKey(b) ||
        a.title.localeCompare(b.title),
    )
    .map((cat) => ({
      slug: cat.slug,
      title: navDisplayTitle(cat),
    }));
}
