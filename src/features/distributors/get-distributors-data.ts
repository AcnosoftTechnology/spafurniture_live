import { prisma } from "@/lib/prisma";
import { normalizeDistributorsContent } from "./normalize-distributors-content";
import {
  defaultDistributorsPageContent,
  distributorsPageSchema,
  DISTRIBUTORS_PAGE_SLUG,
  DISTRIBUTORS_SETTING_KEY,
  type DistributorsPageContent,
} from "./schemas/distributors-content.schema";

function parseDistributorsContent(value: unknown): DistributorsPageContent {
  return distributorsPageSchema.parse(normalizeDistributorsContent(value));
}

export type DistributorsSeo = {
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

export async function getDistributorsContent(): Promise<DistributorsPageContent> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: DISTRIBUTORS_SETTING_KEY } });
    if (!row?.value) return defaultDistributorsPageContent;
    return parseDistributorsContent(row.value);
  } catch {
    return defaultDistributorsPageContent;
  }
}

export async function getDistributorsSeo(): Promise<DistributorsSeo> {
  try {
    const page = await prisma.page.findFirst({
      where: { slug: DISTRIBUTORS_PAGE_SLUG },
      include: { ogImage: true },
    });
    if (!page) {
      return {
        title: "International Distributors",
        seoTitle: "International Distributors | Esthetica Spa Furniture",
        metaDescription:
          "Contact Esthetica for international spa furniture distributors. Find local partners worldwide or enquire about becoming a distributor.",
      };
    }
    return {
      title: page.title,
      seoTitle: page.seoTitle,
      metaDescription: page.metaDescription,
      keywords: page.keywords,
      canonicalUrl: page.canonicalUrl,
      ogTitle: page.ogTitle,
      ogDescription: page.ogDescription,
      ogImage: page.ogImage?.path ?? null,
      robots: page.robots,
    };
  } catch {
    return { title: "International Distributors" };
  }
}

export async function getDistributorsPageData() {
  const [content, seo] = await Promise.all([getDistributorsContent(), getDistributorsSeo()]);
  return { content, seo };
}

export async function saveDistributorsContent(content: DistributorsPageContent) {
  const parsed = parseDistributorsContent(content);
  await prisma.siteSetting.upsert({
    where: { key: DISTRIBUTORS_SETTING_KEY },
    update: { value: parsed },
    create: { key: DISTRIBUTORS_SETTING_KEY, value: parsed },
  });
  return parsed;
}

export type AdminDistributorsEditorData = {
  content: DistributorsPageContent;
  page: {
    title: string;
    seoTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImageId: string | null;
    ogImagePreview: { path: string; webpPath?: string | null; mediaId?: string | null } | null;
    robots: string;
  };
};

export async function getAdminDistributorsEditorData(): Promise<AdminDistributorsEditorData> {
  const [content, page] = await Promise.all([
    getDistributorsContent(),
    prisma.page.findFirst({ where: { slug: DISTRIBUTORS_PAGE_SLUG }, include: { ogImage: true } }),
  ]);

  return {
    content,
    page: {
      title: page?.title ?? "International Distributors",
      seoTitle: page?.seoTitle ?? "International Distributors | Esthetica Spa Furniture",
      metaDescription:
        page?.metaDescription ??
        "Contact Esthetica for international spa furniture distributors. Find local partners worldwide or enquire about becoming a distributor.",
      keywords: page?.keywords ?? [],
      canonicalUrl: page?.canonicalUrl ?? "",
      ogTitle: page?.ogTitle ?? "",
      ogDescription: page?.ogDescription ?? "",
      ogImageId: page?.ogImageId ?? null,
      ogImagePreview: page?.ogImage
        ? { path: page.ogImage.path, webpPath: page.ogImage.webpPath, mediaId: page.ogImage.id }
        : null,
      robots: page?.robots ?? "index,follow",
    },
  };
}
