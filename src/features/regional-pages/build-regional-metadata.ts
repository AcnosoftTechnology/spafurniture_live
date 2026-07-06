import { buildPageMetadata } from "@/lib/seo/metadata";
import { categoryPath } from "@/lib/paths";
import { getRegionalPageData } from "./get-regional-page-data";

export async function buildRegionalPageMetadata(slug: string) {
  const data = await getRegionalPageData(slug);
  if (!data) return {};
  const { seo } = data;
  return buildPageMetadata(
    {
      title: seo.seoTitle || seo.title,
      metaDescription: seo.metaDescription,
      keywords: seo.keywords,
      canonicalUrl: seo.canonicalUrl,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      ogImage: seo.ogImage,
      robots: seo.robots,
    },
    categoryPath(slug),
  );
}
