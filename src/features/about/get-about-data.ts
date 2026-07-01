import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { mediaUrl, slugify } from "@/lib/utils";
import {
  aboutContentSchema,
  defaultAboutContent,
  ABOUT_SETTING_KEY,
  ABOUT_PAGE_ID_KEY,
  type AboutContent,
} from "./schemas/about-content.schema";

export type AboutSeo = {
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

export type AboutPageData = {
  content: AboutContent;
  seo: AboutSeo;
};

function aboutPathFromSlug(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return `/${clean}/`;
}

function resolveOgImagePath(path: string | null | undefined, webpPath: string | null | undefined) {
  const raw = path?.trim() || webpPath?.trim();
  return raw ? mediaUrl(raw) : null;
}

async function readAboutPageId(): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key: ABOUT_PAGE_ID_KEY } });
  if (!row?.value) return null;
  if (typeof row.value === "string" && row.value.trim()) return row.value.trim();
  if (typeof row.value === "object" && row.value !== null && "pageId" in row.value) {
    const pageId = (row.value as { pageId?: unknown }).pageId;
    return typeof pageId === "string" && pageId.trim() ? pageId.trim() : null;
  }
  return null;
}

async function storeAboutPageId(pageId: string) {
  await prisma.siteSetting.upsert({
    where: { key: ABOUT_PAGE_ID_KEY },
    update: { value: pageId },
    create: { key: ABOUT_PAGE_ID_KEY, value: pageId },
  });
}

export async function getAboutPageRecord() {
  const pageId = await readAboutPageId();
  if (pageId) {
    const byId = await prisma.page.findUnique({
      where: { id: pageId },
      include: { ogImage: true },
    });
    if (byId) return byId;
  }

  const legacy = await prisma.page.findFirst({
    where: { slug: { in: ["about", "about-us"] } },
    orderBy: { updatedAt: "desc" },
    include: { ogImage: true },
  });
  if (legacy) await storeAboutPageId(legacy.id);
  return legacy;
}

export async function ensureAboutPageRecord() {
  const existing = await getAboutPageRecord();
  if (existing) return existing;

  const created = await prisma.page.create({
    data: {
      title: "About Us",
      slug: "about",
      status: "PUBLISHED",
      publishedAt: new Date(),
      robots: "index,follow",
    },
    include: { ogImage: true },
  });
  await storeAboutPageId(created.id);
  return created;
}

export async function getAboutPublicSlug(): Promise<string> {
  const page = await getAboutPageRecord();
  return page?.slug ?? "about";
}

export async function isAboutPageSlug(slug: string): Promise<boolean> {
  const aboutSlug = await getAboutPublicSlug();
  return slug === aboutSlug;
}

export function mapAboutSeo(page: {
  title: string;
  seoTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  robots: string | null;
  ogImage: { path: string; webpPath: string | null } | null;
}): AboutSeo {
  return {
    title: page.title,
    seoTitle: page.seoTitle,
    metaDescription: page.metaDescription,
    keywords: page.keywords,
    canonicalUrl: page.canonicalUrl,
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    ogImage: resolveOgImagePath(page.ogImage?.path, page.ogImage?.webpPath),
    robots: page.robots,
  };
}

export async function getAboutContent(): Promise<AboutContent> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: ABOUT_SETTING_KEY } });
    if (!row?.value) return defaultAboutContent;
    return aboutContentSchema.parse(migrateLegacyAboutContent(row.value));
  } catch {
    return defaultAboutContent;
  }
}

function migrateLegacyAboutContent(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  if (record.teamBanner) return value;

  if (record.teamBanner && typeof record.teamBanner === "object") {
    const teamBanner = { ...(record.teamBanner as Record<string, unknown>) };
    if (teamBanner.transitionEffect === "pixelate") {
      teamBanner.transitionEffect = "signature";
    }
    return { ...record, teamBanner };
  }

  if (record.team && typeof record.team === "object") {
    const team = record.team as Record<string, unknown>;
    const { team: _legacyTeam, ...rest } = record;
    return {
      ...rest,
      teamBanner: {
        autoplaySeconds: 6,
        transitionEffect: "fade",
        slides: [
          {
            imagePath: String(team.imagePath ?? ""),
            mediaId: (team.mediaId as string | null | undefined) ?? null,
            alt: String(team.alt ?? "Esthetica team"),
            overlayText: String(team.overlayText ?? ""),
          },
        ],
      },
    };
  }

  return value;
}

export async function getAboutSeo(): Promise<AboutSeo> {
  try {
    const page = await getAboutPageRecord();
    if (!page) {
      return {
        title: "About Us",
        metaDescription:
          "Learn about Esthetica — leading spa and salon furniture manufacturer since 2011.",
      };
    }
    return mapAboutSeo(page);
  } catch {
    return { title: "About Us" };
  }
}

export async function getAboutPageData(): Promise<AboutPageData> {
  const [content, seo] = await Promise.all([getAboutContent(), getAboutSeo()]);
  return { content, seo };
}

export async function buildAboutPageMetadata(): Promise<Metadata> {
  const [{ seo }, slug] = await Promise.all([getAboutPageData(), getAboutPublicSlug()]);
  return buildPageMetadata(
    {
      title: seo.seoTitle || seo.title || "About Us",
      metaDescription:
        seo.metaDescription ||
        "Learn about Esthetica — leading spa and salon furniture manufacturer since 2011.",
      keywords: seo.keywords,
      canonicalUrl: seo.canonicalUrl,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      ogImage: seo.ogImage,
      robots: seo.robots,
    },
    aboutPathFromSlug(slug),
  );
}

export async function saveAboutContent(content: AboutContent) {
  const parsed = aboutContentSchema.parse(content);
  await prisma.siteSetting.upsert({
    where: { key: ABOUT_SETTING_KEY },
    update: { value: parsed },
    create: { key: ABOUT_SETTING_KEY, value: parsed },
  });
  return parsed;
}

export type AdminAboutEditorData = {
  content: AboutContent;
  page: {
    slug: string;
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

export async function getAdminAboutEditorData(): Promise<AdminAboutEditorData> {
  const [content, page] = await Promise.all([getAboutContent(), ensureAboutPageRecord()]);

  return {
    content,
    page: {
      slug: page.slug,
      title: page.title,
      seoTitle: page.seoTitle ?? "",
      metaDescription: page.metaDescription ?? "",
      keywords: page.keywords ?? [],
      canonicalUrl: page.canonicalUrl ?? "",
      ogTitle: page.ogTitle ?? "",
      ogDescription: page.ogDescription ?? "",
      ogImageId: page.ogImageId ?? null,
      ogImagePreview: page.ogImage
        ? {
            path: page.ogImage.path,
            webpPath: page.ogImage.webpPath,
            mediaId: page.ogImage.id,
          }
        : null,
      robots: page.robots ?? "index,follow",
    },
  };
}

export async function saveAboutPageSeo(input: {
  slug: string;
  title: string;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageId?: string | null;
  robots?: string;
}) {
  const page = await ensureAboutPageRecord();
  const previousSlug = page.slug;
  const nextSlug = slugify(input.slug || "about") || "about";

  if (nextSlug !== page.slug) {
    const conflict = await prisma.page.findFirst({
      where: { slug: nextSlug, NOT: { id: page.id } },
      select: { id: true },
    });
    if (conflict) {
      throw new Error(`Slug "${nextSlug}" is already used by another page.`);
    }
  }

  const ogImageId = input.ogImageId ? String(input.ogImageId) : null;

  const updated = await prisma.page.update({
    where: { id: page.id },
    data: {
      slug: nextSlug,
      title: String(input.title ?? "About Us"),
      seoTitle: input.seoTitle ? String(input.seoTitle) : null,
      metaDescription: input.metaDescription ? String(input.metaDescription) : null,
      keywords: Array.isArray(input.keywords) ? input.keywords.map(String) : [],
      canonicalUrl: input.canonicalUrl ? String(input.canonicalUrl) : null,
      ogTitle: input.ogTitle ? String(input.ogTitle) : null,
      ogDescription: input.ogDescription ? String(input.ogDescription) : null,
      ogImage: ogImageId ? { connect: { id: ogImageId } } : { disconnect: true },
      robots: input.robots ? String(input.robots) : "index,follow",
      status: "PUBLISHED",
      publishedAt: page.publishedAt ?? new Date(),
    },
    include: { ogImage: true },
  });

  await storeAboutPageId(updated.id);

  return { page: updated, previousSlug, nextSlug };
}

export { aboutPathFromSlug };
