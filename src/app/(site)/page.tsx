import type { Metadata } from "next";
import { HeroLcpPreloads } from "@/components/site/home/hero-banner";
import { HomepageShell } from "@/components/site/home/homepage-shell";
import { getHomepageContent, getHomepageSeo } from "@/features/homepage/get-homepage-data";
import { buildPageMetadata } from "@/lib/seo/metadata";

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
  const homepage = await getHomepageContent();
  return (
    <>
      <HeroLcpPreloads hero={homepage.hero} />
      <HomepageShell />
    </>
  );
}
