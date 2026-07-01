import { BrochurePageView } from "@/components/site/brochure/brochure-page-view";
import { getBrochurePageData } from "@/features/brochure/get-brochure-data";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateMetadata() {
  const { seo } = await getBrochurePageData();
  return buildPageMetadata({
    title: seo.seoTitle || seo.title || "Brochure",
    metaDescription:
      seo.metaDescription ||
      "Browse the Esthetica spa furniture digital brochure and download the PDF catalogue.",
    keywords: seo.keywords,
    canonicalUrl: seo.canonicalUrl,
    ogTitle: seo.ogTitle,
    ogDescription: seo.ogDescription,
    ogImage: seo.ogImage,
    robots: seo.robots,
  });
}

export default async function BrochurePage() {
  const data = await getBrochurePageData();
  return <BrochurePageView data={data} />;
}
