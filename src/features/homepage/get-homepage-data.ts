import { prisma } from "@/lib/prisma";
import { defaultHomepageContent, homepageContentSchema, type HomepageContent } from "./schemas/homepage-content.schema";

export type HomepageCategoryFeature = {
  id: string;
  title: string;
  slug: string;
  homepageFeatureContent: string | null;
  homepageFeatureBgPath: string | null;
  imagePath: string | null;
};

export type HomepageFaq = {
  id: string;
  question: string;
  answer: string;
  schemaEnabled: boolean;
};

export type HomepageSeo = {
  title: string;
  seoTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterCard?: string | null;
  robots?: string | null;
  schemaJson?: unknown;
};

export type HomepageData = {
  content: HomepageContent;
  categories: HomepageCategoryFeature[];
  faqs: HomepageFaq[];
  seo: HomepageSeo;
};

const HOMEPAGE_SETTING_KEY = "homepage";
const HOMEPAGE_FAQ_ENTITY = "home";

function resolveMediaPath(path: string | null | undefined, fallback?: string | null) {
  return path ?? fallback ?? null;
}

export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: HOMEPAGE_SETTING_KEY } });
    if (!row?.value) return defaultHomepageContent;
    return homepageContentSchema.parse(row.value);
  } catch {
    return defaultHomepageContent;
  }
}

export async function getHomepageCategories(): Promise<HomepageCategoryFeature[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { homepageFeatured: true, status: "PUBLISHED" },
      orderBy: [{ homepageFeaturedSortOrder: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        homepageFeatureContent: true,
        thumbMedia: { select: { path: true } },
        bannerMedia: { select: { path: true } },
        homepageFeatureBgMedia: { select: { path: true } },
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
      homepageFeatureContent: cat.homepageFeatureContent,
      homepageFeatureBgPath: cat.homepageFeatureBgMedia?.path ?? null,
      imagePath: resolveMediaPath(cat.thumbMedia?.path, cat.bannerMedia?.path),
    }));
  } catch (error) {
    console.error("getHomepageCategories failed:", error);
    return [];
  }
}

export async function getHomepageFaqs(): Promise<HomepageFaq[]> {
  try {
    const faqs = await prisma.faq.findMany({
      where: { entityType: "HOMEPAGE", entityId: HOMEPAGE_FAQ_ENTITY },
      orderBy: { sortOrder: "asc" },
    });
    return faqs.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      schemaEnabled: f.schemaEnabled,
    }));
  } catch {
    return [];
  }
}

export async function getHomepageSeo(): Promise<HomepageSeo> {
  try {
    const page = await prisma.page.findFirst({
      where: { slug: "home", status: "PUBLISHED" },
      include: { ogImage: true },
    });

    if (!page) {
      return {
        title: "Esthetica Spa Furniture",
        metaDescription: "Premium spa and salon furniture — luxury massage beds, spa tables, and wellness furniture manufactured in India.",
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
      twitterCard: page.twitterCard,
      robots: page.robots,
      schemaJson: page.schemaJson,
    };
  } catch {
    return {
      title: "Esthetica Spa Furniture",
      metaDescription: "Premium spa and salon furniture — luxury massage beds, spa tables, and wellness furniture manufactured in India.",
    };
  }
}

export async function getHomepageData(): Promise<HomepageData> {
  const [content, categories, faqs, seo] = await Promise.all([
    getHomepageContent(),
    getHomepageCategories(),
    getHomepageFaqs(),
    getHomepageSeo(),
  ]);

  return { content, categories, faqs, seo };
}

export async function saveHomepageContent(content: HomepageContent) {
  const parsed = homepageContentSchema.parse(content);
  await prisma.siteSetting.upsert({
    where: { key: HOMEPAGE_SETTING_KEY },
    update: { value: parsed },
    create: { key: HOMEPAGE_SETTING_KEY, value: parsed },
  });
  return parsed;
}

export { HOMEPAGE_SETTING_KEY, HOMEPAGE_FAQ_ENTITY };

export type AdminHomepageEditorData = {
  content: HomepageContent;
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
  faqs: Array<{ question: string; answer: string; sortOrder: number; schemaEnabled: boolean }>;
  categories: Array<{
    id: string;
    title: string;
    slug: string;
    homepageFeatured: boolean;
    homepageFeaturedSortOrder: number;
    menuLabel: string;
    showInProductNav: boolean;
  }>;
};

type AdminHomepageRaw = {
  content?: unknown;
  page?: {
    title?: string | null;
    seoTitle?: string | null;
    metaDescription?: string | null;
    keywords?: string[];
    canonicalUrl?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImageId?: string | null;
    ogImage?: { id: string; path: string; webpPath?: string | null } | null;
    robots?: string | null;
  } | null;
  faqs?: Array<{
    question: string;
    answer: string;
    sortOrder?: number;
    schemaEnabled?: boolean;
  }>;
  categories?: Array<{
    id: string;
    title: string;
    slug: string;
    homepageFeatured: boolean;
    homepageFeaturedSortOrder?: number;
    menuLabel?: string | null;
    showInProductNav?: boolean;
  }>;
};

export function normalizeAdminHomepagePayload(raw: AdminHomepageRaw): AdminHomepageEditorData {
  let content: HomepageContent = defaultHomepageContent;
  if (raw.content) {
    const parsed = homepageContentSchema.safeParse(raw.content);
    content = parsed.success ? parsed.data : defaultHomepageContent;
  }

  const page = raw.page;

  return {
    content,
    page: {
      title: page?.title ?? "Home",
      seoTitle: page?.seoTitle ?? "",
      metaDescription: page?.metaDescription ?? "",
      keywords: page?.keywords ?? [],
      canonicalUrl: page?.canonicalUrl ?? "",
      ogTitle: page?.ogTitle ?? "",
      ogDescription: page?.ogDescription ?? "",
      ogImageId: page?.ogImageId ?? page?.ogImage?.id ?? null,
      ogImagePreview: page?.ogImage
        ? { path: page.ogImage.path, webpPath: page.ogImage.webpPath, mediaId: page.ogImage.id }
        : null,
      robots: page?.robots ?? "index,follow",
    },
    faqs: (raw.faqs ?? []).map((f, i) => ({
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder ?? i,
      schemaEnabled: f.schemaEnabled ?? true,
    })),
    categories: (raw.categories ?? []).map((cat) => ({
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
      homepageFeatured: cat.homepageFeatured,
      homepageFeaturedSortOrder: cat.homepageFeaturedSortOrder ?? 0,
      menuLabel: cat.menuLabel ?? "",
      showInProductNav: cat.showInProductNav ?? false,
    })),
  };
}

export async function getAdminHomepageEditorData(): Promise<AdminHomepageEditorData> {
  const [content, page, faqs, categories] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: HOMEPAGE_SETTING_KEY } }),
    prisma.page.findFirst({ where: { slug: "home" }, include: { ogImage: true } }),
    prisma.faq.findMany({
      where: { entityType: "HOMEPAGE", entityId: HOMEPAGE_FAQ_ENTITY },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.category.findMany({
      orderBy: [
        { homepageFeatured: "desc" },
        { homepageFeaturedSortOrder: "asc" },
        { sortOrder: "asc" },
        { title: "asc" },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        homepageFeatured: true,
        homepageFeaturedSortOrder: true,
        menuLabel: true,
        showInProductNav: true,
      },
    }),
  ]);

  return normalizeAdminHomepagePayload({
    content: content?.value ?? null,
    page,
    faqs,
    categories,
  });
}
