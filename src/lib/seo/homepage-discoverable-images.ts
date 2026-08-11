import {
  getHomepageCategories,
  getHomepageContent,
  getHomepageSeo,
} from "@/features/homepage/get-homepage-data";
import { categoryCanonicalUrl } from "@/lib/paths";
import { mediaUrl } from "@/lib/utils";

const MAX_FEATURED_ITEMS = 8;

export type HomepageDiscoverableItem = {
  name: string;
  url: string;
  image: string;
};

export type HomepageDiscoverableImages = {
  images: string[];
  items: HomepageDiscoverableItem[];
  primaryImage: string | null;
  pageName: string;
};

/** Same bundled-PNG upgrade as the hero banner — SEO only, no render change. */
function resolveHeroImagePath(imagePath: string) {
  if (
    imagePath === "/assets/images/bg/spa-main.png" ||
    imagePath === "/assets/images/bg/spa-main-original.png"
  ) {
    return "/assets/images/bg/spa-main.webp";
  }
  return imagePath;
}

function abs(baseUrl: string, path: string | null | undefined): string | null {
  if (!path?.trim()) return null;
  const rel = mediaUrl(path.trim());
  if (rel.startsWith("http://") || rel.startsWith("https://")) return rel;
  return `${baseUrl}${rel}`;
}

function unique(urls: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const url of urls) {
    if (!url?.trim() || seen.has(url)) continue;
    seen.add(url);
    result.push(url);
  }
  return result;
}

/**
 * Distinct product/category photos already shown on the homepage.
 * Used by image sitemap + JSON-LD only — never changes layout.
 */
export async function collectHomepageDiscoverableImages(
  baseUrl: string,
): Promise<HomepageDiscoverableImages> {
  const empty: HomepageDiscoverableImages = {
    images: [],
    items: [],
    primaryImage: null,
    pageName: "Esthetica Spa Furniture",
  };

  try {
    const [content, categories, seo] = await Promise.all([
      getHomepageContent(),
      getHomepageCategories(),
      getHomepageSeo(),
    ]);

    const heroPath = resolveHeroImagePath(content.hero.imagePath);
    const heroUrl = abs(baseUrl, heroPath);
    const ogUrl = abs(baseUrl, seo.ogImage);

    const items: HomepageDiscoverableItem[] = [];
    for (const category of categories.slice(0, MAX_FEATURED_ITEMS)) {
      const image = abs(baseUrl, category.imagePath);
      if (!image) continue;
      items.push({
        name: category.title,
        url: categoryCanonicalUrl(category.slug, baseUrl),
        image,
      });
    }

    return {
      images: unique([heroUrl, ogUrl, ...items.map((item) => item.image)]),
      items,
      primaryImage: heroUrl ?? ogUrl ?? items[0]?.image ?? null,
      pageName: seo.seoTitle?.trim() || seo.title?.trim() || empty.pageName,
    };
  } catch (error) {
    console.error("[seo] homepage discoverable images failed:", error);
    return empty;
  }
}
