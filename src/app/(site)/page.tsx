import type { Metadata } from "next";
import { HomepageShell } from "@/components/site/home/homepage-shell";
import { getHomepageFaqs, getHomepageSeo } from "@/features/homepage/get-homepage-data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildHomepageSchemas } from "@/lib/seo/build-schemas";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getHomepageSeo();
  return buildPageMetadata(
    {
      title: seo.title,
      seoTitle: seo.seoTitle,
      metaDescription: seo.metaDescription,
      keywords: seo.keywords,
      canonicalUrl: seo.canonicalUrl,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      ogImage: seo.ogImage,
      twitterCard: seo.twitterCard,
      robots: seo.robots,
    },
    "/",
  );
}

export default async function HomePage() {
  const faqs = await getHomepageFaqs();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={buildHomepageSchemas(faqs)} />
      <HomepageShell />
    </>
  );
}
