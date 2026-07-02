import { InternationalDistributorsView } from "@/components/site/distributors/international-distributors-view";
import { getDistributorsPageData } from "@/features/distributors/get-distributors-data";
import { getHomepageContent } from "@/features/homepage/get-homepage-data";
import { getSiteConfig } from "@/lib/site-settings";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { mediaUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata() {
  const { seo } = await getDistributorsPageData();
  return buildPageMetadata(
    {
      title: seo.seoTitle || seo.title || "International Distributors",
      metaDescription: seo.metaDescription,
      keywords: seo.keywords,
      canonicalUrl: seo.canonicalUrl,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      ogImage: seo.ogImage ? mediaUrl(seo.ogImage) : undefined,
      robots: seo.robots,
    },
    "/international-distributors/",
  );
}

export default async function InternationalDistributorsPage() {
  const [{ content }, site, homepage] = await Promise.all([
    getDistributorsPageData(),
    getSiteConfig(),
    getHomepageContent(),
  ]);
  const socialLinks = site.social.length ? site.social : homepage.footer.social;

  return <InternationalDistributorsView content={content} socialLinks={socialLinks} />;
}
