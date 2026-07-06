import { prisma } from "@/lib/prisma";
import {
  REGIONAL_PAGE_TEMPLATE,
  REGIONAL_SLUG_BLOCKLIST,
  regionalSettingKey,
} from "./constants";
import introDefaults from "./default-regional-intro.json";
import {
  defaultRegionalPageContent,
  normalizeIntroHtml,
  regionalPageContentSchema,
  type RegionalPageContent,
} from "./schemas/regional-content.schema";

export type RegionalPageListItem = {
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  updatedAt: string;
};

export type RegionalPageSeoFields = {
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
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export type AdminRegionalPageEditorData = {
  slug: string;
  content: RegionalPageContent;
  page: RegionalPageSeoFields;
};

const LEGACY_SLUGS = ["uae", "saudi-arabia", "qatar"] as const;

function normalizeSlug(raw: string) {
  return raw.trim().toLowerCase();
}

function isValidSlugFormat(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function emptyRegionalContent(title: string): RegionalPageContent {
  return regionalPageContentSchema.parse({
    hero: {
      imagePath: "/assets/images/bg/spa-main.png",
      alt: title,
      caption: "",
    },
    intro: {
      arabicHtml: "<h1 class=\"esth-regional-intro-title\"><strong></strong></h1><p></p>",
      englishHtml: "<h1 class=\"esth-regional-intro-title\"><strong></strong></h1><p></p>",
      arabicButtonLabel: "العربية",
      englishButtonLabel: "ENGLISH",
    },
    productsIntro: {
      tag: "OUR PRODUCTS",
      heading: "Crafted till\nPerfection",
      body: "Explore our extensive collection of premium spa and salon furniture.",
    },
  });
}

function legacyIntroForSlug(slug: string) {
  const row = introDefaults[slug as keyof typeof introDefaults];
  if (!row) return null;
  return {
    arabicHtml: normalizeIntroHtml(row.arabicHtml),
    englishHtml: normalizeIntroHtml(row.englishHtml),
    arabicButtonLabel: "العربية",
    englishButtonLabel: "ENGLISH",
  };
}

function defaultContentForSlug(slug: string, title: string): RegionalPageContent {
  if (Object.hasOwn(defaultRegionalPageContent, slug)) {
    return defaultRegionalPageContent[slug as keyof typeof defaultRegionalPageContent];
  }
  const base = emptyRegionalContent(title);
  const legacy = legacyIntroForSlug(slug);
  if (legacy) {
    base.intro = legacy;
  }
  return base;
}

export async function ensureLegacyRegionalPages() {
  for (const slug of LEGACY_SLUGS) {
    const title =
      slug === "uae" ? "UAE" : slug === "saudi-arabia" ? "Saudi Arabia" : "Qatar";

    const page = await prisma.page.findUnique({ where: { slug } });
    if (page && page.template !== REGIONAL_PAGE_TEMPLATE) {
      await prisma.page.update({
        where: { slug },
        data: { template: REGIONAL_PAGE_TEMPLATE },
      });
    }

    if (!page) {
      await prisma.page.create({
        data: {
          slug,
          title,
          template: REGIONAL_PAGE_TEMPLATE,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { key: regionalSettingKey(slug) },
    });
    if (!setting) {
      await prisma.siteSetting.create({
        data: {
          key: regionalSettingKey(slug),
          value: defaultContentForSlug(slug, title),
        },
      });
    }
  }
}

export async function listRegionalPages(): Promise<RegionalPageListItem[]> {
  await ensureLegacyRegionalPages();
  const pages = await prisma.page.findMany({
    where: { template: REGIONAL_PAGE_TEMPLATE },
    orderBy: [{ title: "asc" }],
    select: { slug: true, title: true, status: true, updatedAt: true },
  });
  return pages.map((p) => ({
    slug: p.slug,
    title: p.title,
    status: p.status,
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function isRegionalPageSlug(slug: string): Promise<boolean> {
  const normalized = normalizeSlug(slug);
  const page = await prisma.page.findFirst({
    where: { slug: normalized, template: REGIONAL_PAGE_TEMPLATE, status: "PUBLISHED" },
    select: { id: true },
  });
  return !!page;
}

export async function getRegionalPageRecord(slug: string) {
  const normalized = normalizeSlug(slug);
  return prisma.page.findFirst({
    where: { slug: normalized, template: REGIONAL_PAGE_TEMPLATE },
    include: { ogImage: true },
  });
}

export async function getRegionalContent(slug: string): Promise<RegionalPageContent | null> {
  const normalized = normalizeSlug(slug);
  const page = await getRegionalPageRecord(normalized);
  if (!page) return null;

  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: regionalSettingKey(normalized) },
    });
    if (row?.value) {
      const parsed = regionalPageContentSchema.parse(row.value);
      return {
        ...parsed,
        intro: {
          ...parsed.intro,
          arabicHtml: normalizeIntroHtml(parsed.intro.arabicHtml),
          englishHtml: normalizeIntroHtml(parsed.intro.englishHtml),
        },
      };
    }
  } catch {
    /* fall through */
  }

  return defaultContentForSlug(normalized, page.title);
}

export async function getRegionalSeo(slug: string) {
  const normalized = normalizeSlug(slug);
  const page = await getRegionalPageRecord(normalized);
  if (!page) return null;

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
}

export async function saveRegionalContent(slug: string, content: RegionalPageContent) {
  const normalized = normalizeSlug(slug);
  const parsed = regionalPageContentSchema.parse(content);
  await prisma.siteSetting.upsert({
    where: { key: regionalSettingKey(normalized) },
    update: { value: parsed },
    create: { key: regionalSettingKey(normalized), value: parsed },
  });
  return parsed;
}

export async function getAdminRegionalPageEditorData(
  slug: string,
): Promise<AdminRegionalPageEditorData | null> {
  const normalized = normalizeSlug(slug);
  const page = await getRegionalPageRecord(normalized);
  if (!page) return null;

  const content = await getRegionalContent(normalized);
  if (!content) return null;

  return {
    slug: normalized,
    content,
    page: {
      title: page.title,
      seoTitle: page.seoTitle ?? "",
      metaDescription: page.metaDescription ?? "",
      keywords: page.keywords ?? [],
      canonicalUrl: page.canonicalUrl ?? "",
      ogTitle: page.ogTitle ?? "",
      ogDescription: page.ogDescription ?? "",
      ogImageId: page.ogImageId ?? null,
      ogImagePreview: page.ogImage
        ? { path: page.ogImage.path, webpPath: page.ogImage.webpPath, mediaId: page.ogImage.id }
        : null,
      robots: page.robots ?? "index,follow",
      status: page.status,
    },
  };
}

export async function assertRegionalSlugAvailable(slug: string) {
  const normalized = normalizeSlug(slug);
  if (!isValidSlugFormat(normalized)) {
    throw new Error("Slug must use lowercase letters, numbers, and hyphens only.");
  }
  if ((REGIONAL_SLUG_BLOCKLIST as readonly string[]).includes(normalized)) {
    throw new Error("This slug is reserved for another part of the site.");
  }

  const [category, post, existingPage] = await Promise.all([
    prisma.category.findUnique({ where: { slug: normalized }, select: { id: true } }),
    prisma.blogPost.findUnique({ where: { slug: normalized }, select: { id: true } }),
    prisma.page.findUnique({ where: { slug: normalized }, select: { id: true, template: true } }),
  ]);

  if (category) throw new Error("A product category already uses this slug.");
  if (post) throw new Error("A blog post already uses this slug.");
  if (existingPage) {
    throw new Error(
      existingPage.template === REGIONAL_PAGE_TEMPLATE
        ? "A regional page with this slug already exists."
        : "Another page already uses this slug.",
    );
  }
}

export async function createRegionalPage(input: { slug: string; title: string }) {
  const slug = normalizeSlug(input.slug);
  const title = input.title.trim() || slug;
  await assertRegionalSlugAvailable(slug);

  await prisma.page.create({
    data: {
      slug,
      title,
      template: REGIONAL_PAGE_TEMPLATE,
      status: "DRAFT",
    },
  });

  await saveRegionalContent(slug, defaultContentForSlug(slug, title));
  return { slug, title };
}

export async function saveRegionalPage(
  slug: string,
  input: { content?: RegionalPageContent; page?: Partial<RegionalPageSeoFields> },
) {
  const normalized = normalizeSlug(slug);
  const existing = await getRegionalPageRecord(normalized);
  if (!existing) throw new Error("Regional page not found.");

  if (input.content) {
    await saveRegionalContent(normalized, input.content);
  }

  if (input.page) {
    const page = input.page;
    const ogImageId = page.ogImageId ? String(page.ogImageId) : null;
    const status = page.status ?? existing.status;
    await prisma.page.update({
      where: { id: existing.id },
      data: {
        title: page.title ? String(page.title) : existing.title,
        seoTitle: page.seoTitle != null ? String(page.seoTitle) : null,
        metaDescription: page.metaDescription != null ? String(page.metaDescription) : null,
        keywords: Array.isArray(page.keywords) ? page.keywords.map(String) : undefined,
        canonicalUrl: page.canonicalUrl != null ? String(page.canonicalUrl) : null,
        ogTitle: page.ogTitle != null ? String(page.ogTitle) : null,
        ogDescription: page.ogDescription != null ? String(page.ogDescription) : null,
        ogImage: ogImageId ? { connect: { id: ogImageId } } : { disconnect: true },
        robots: page.robots != null ? String(page.robots) : undefined,
        status,
        publishedAt: status === "PUBLISHED" ? existing.publishedAt ?? new Date() : null,
      },
    });
  }

  return getAdminRegionalPageEditorData(normalized);
}

export async function deleteRegionalPage(slug: string) {
  const normalized = normalizeSlug(slug);
  const page = await getRegionalPageRecord(normalized);
  if (!page) throw new Error("Regional page not found.");

  await prisma.$transaction([
    prisma.page.delete({ where: { id: page.id } }),
    prisma.siteSetting.deleteMany({ where: { key: regionalSettingKey(normalized) } }),
  ]);
}
