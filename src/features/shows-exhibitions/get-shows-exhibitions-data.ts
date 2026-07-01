import { prisma } from "@/lib/prisma";
import {
  defaultShowsExhibitionsPageContent,
  SHOWS_EXHIBITIONS_PAGE_SLUG,
  SHOWS_EXHIBITIONS_SETTING_KEY,
  showsExhibitionsPageSchema,
  type ShowsExhibitionsPageContent,
} from "./schemas/shows-exhibitions-content.schema";

export type ShowsExhibitionsSeo = {
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

export async function getShowsExhibitionsContent(): Promise<ShowsExhibitionsPageContent> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: SHOWS_EXHIBITIONS_SETTING_KEY } });
    if (!row?.value) return defaultShowsExhibitionsPageContent;
    return showsExhibitionsPageSchema.parse(row.value);
  } catch {
    return defaultShowsExhibitionsPageContent;
  }
}

export async function getShowsExhibitionsSeo(): Promise<ShowsExhibitionsSeo> {
  try {
    const page = await prisma.page.findFirst({
      where: { slug: SHOWS_EXHIBITIONS_PAGE_SLUG },
      include: { ogImage: true },
    });
    if (!page) {
      return {
        title: "Shows & Exhibitions",
        seoTitle: "Shows & Exhibitions | Esthetica Spa Furniture",
        metaDescription:
          "Find Esthetica at upcoming spa furniture shows, trade fairs and exhibitions across India and worldwide.",
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
    return { title: "Shows & Exhibitions" };
  }
}

export async function getShowsExhibitionsPageData() {
  const [content, seo] = await Promise.all([getShowsExhibitionsContent(), getShowsExhibitionsSeo()]);

  let bannerPath: string | null = null;
  let bannerWebpPath: string | null = null;
  if (content.bannerMediaId) {
    const media = await prisma.media.findUnique({
      where: { id: content.bannerMediaId },
      select: { path: true, webpPath: true },
    });
    bannerPath = media?.path ?? null;
    bannerWebpPath = media?.webpPath ?? null;
  }

  return {
    content,
    seo,
    bannerPath,
    bannerWebpPath,
  };
}

export async function saveShowsExhibitionsContent(content: ShowsExhibitionsPageContent) {
  const parsed = showsExhibitionsPageSchema.parse(content);
  await prisma.siteSetting.upsert({
    where: { key: SHOWS_EXHIBITIONS_SETTING_KEY },
    update: { value: parsed },
    create: { key: SHOWS_EXHIBITIONS_SETTING_KEY, value: parsed },
  });
  return parsed;
}

export type AdminShowsExhibitionsEditorData = {
  content: ShowsExhibitionsPageContent;
  bannerPreview: { path: string; webpPath?: string | null; mediaId?: string | null } | null;
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

export async function getAdminShowsExhibitionsEditorData(): Promise<AdminShowsExhibitionsEditorData> {
  const [content, page] = await Promise.all([
    getShowsExhibitionsContent(),
    prisma.page.findFirst({
      where: { slug: SHOWS_EXHIBITIONS_PAGE_SLUG },
      include: { ogImage: true },
    }),
  ]);

  let bannerPreview: AdminShowsExhibitionsEditorData["bannerPreview"] = null;
  if (content.bannerMediaId) {
    const media = await prisma.media.findUnique({ where: { id: content.bannerMediaId } });
    if (media) {
      bannerPreview = {
        path: media.path,
        webpPath: media.webpPath,
        mediaId: media.id,
      };
    }
  }

  return {
    content,
    bannerPreview,
    page: {
      title: page?.title ?? "Shows & Exhibitions",
      seoTitle: page?.seoTitle ?? "Shows & Exhibitions | Esthetica Spa Furniture",
      metaDescription:
        page?.metaDescription ??
        "Find Esthetica at upcoming spa furniture shows, trade fairs and exhibitions across India and worldwide.",
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
