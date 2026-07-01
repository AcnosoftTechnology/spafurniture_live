import type { Metadata } from "next";
import { HomepageShell } from "@/components/site/home/homepage-shell";
import { getHomepageSeo } from "@/features/homepage/get-homepage-data";
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

export default function HomePage() {
  return <HomepageShell />;
}
