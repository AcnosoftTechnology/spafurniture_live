import { InternationalDistributorsView } from "@/components/site/distributors/international-distributors-view";
import { getHomepageContent } from "@/features/homepage/get-homepage-data";
import { getSiteConfig } from "@/lib/site-settings";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata(
    {
      title: "International Distributors",
      metaDescription:
        "Contact Esthetica for international spa furniture distributors. Find local partners worldwide or enquire about becoming a distributor.",
    },
    "/international-distributors/",
  );
}

export default async function InternationalDistributorsPage() {
  const [site, homepage] = await Promise.all([getSiteConfig(), getHomepageContent()]);
  const socialLinks = site.social.length ? site.social : homepage.footer.social;

  return <InternationalDistributorsView socialLinks={socialLinks} />;
}
