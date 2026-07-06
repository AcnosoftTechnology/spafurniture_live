import { getHomepageCategories, getHomepageContent } from "@/features/homepage/get-homepage-data";
import type { HomepageCategoryFeature } from "@/features/homepage/get-homepage-data";
import type { HomepageContent } from "@/features/homepage/schemas/homepage-content.schema";
import type { RegionalPageContent } from "./schemas/regional-content.schema";
import {
  getRegionalContent,
  getRegionalSeo,
} from "./regional-page.service";

export type RegionalPageSeo = {
  title: string;
  seoTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  robots?: string | null;
};

export type RegionalPageData = {
  content: RegionalPageContent;
  categories: HomepageCategoryFeature[];
  clients: HomepageContent["clients"];
  seo: RegionalPageSeo;
};

export async function getRegionalPageData(slug: string): Promise<RegionalPageData | null> {
  const [content, categories, homepageContent, seo] = await Promise.all([
    getRegionalContent(slug),
    getHomepageCategories(),
    getHomepageContent(),
    getRegionalSeo(slug),
  ]);

  if (!content || !seo) return null;

  return {
    content,
    categories,
    clients: homepageContent.clients,
    seo,
  };
}
