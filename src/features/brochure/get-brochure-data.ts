import { prisma } from "@/lib/prisma";
import {
  brochurePageSchema,
  defaultBrochurePageContent,
  BROCHURE_SETTING_KEY,
  type BrochurePageContent,
} from "./schemas/brochure-content.schema";

export type BrochurePdf = {
  mediaId: string;
  path: string;
  filename: string;
};

export type BrochurePageData = {
  content: BrochurePageContent;
  pdf: BrochurePdf | null;
  seo: {
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
};

async function resolvePdf(mediaId: string | null | undefined): Promise<BrochurePdf | null> {
  if (!mediaId) return null;
  try {
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) return null;
    return { mediaId: media.id, path: media.path, filename: media.filename };
  } catch {
    return null;
  }
}

export async function getBrochureContent(): Promise<BrochurePageContent> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: BROCHURE_SETTING_KEY } });
    if (!row?.value) return defaultBrochurePageContent;
    return brochurePageSchema.parse(row.value);
  } catch {
    return defaultBrochurePageContent;
  }
}

export async function getBrochurePageData(): Promise<BrochurePageData> {
  const content = await getBrochureContent();
  const [pdf, page] = await Promise.all([
    resolvePdf(content.pdfMediaId),
    prisma.page.findFirst({ where: { slug: "brochure" }, include: { ogImage: true } }).catch(() => null),
  ]);

  return {
    content,
    pdf,
    seo: {
      title: page?.title ?? "Brochure",
      seoTitle: page?.seoTitle ?? "Spa Furniture Brochure | Esthetica",
      metaDescription:
        page?.metaDescription ??
        "Browse the Esthetica spa furniture digital brochure and download the PDF catalogue.",
      keywords: page?.keywords,
      canonicalUrl: page?.canonicalUrl,
      ogTitle: page?.ogTitle,
      ogDescription: page?.ogDescription,
      ogImage: page?.ogImage?.path ?? null,
      robots: page?.robots,
    },
  };
}

export async function saveBrochureContent(content: BrochurePageContent) {
  const parsed = brochurePageSchema.parse(content);
  await prisma.siteSetting.upsert({
    where: { key: BROCHURE_SETTING_KEY },
    update: { value: parsed },
    create: { key: BROCHURE_SETTING_KEY, value: parsed },
  });
  return parsed;
}

export type AdminBrochureEditorData = {
  content: BrochurePageContent;
  pdf: BrochurePdf | null;
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

export async function getAdminBrochureEditorData(): Promise<AdminBrochureEditorData> {
  const content = await getBrochureContent();
  const [pdf, page] = await Promise.all([
    resolvePdf(content.pdfMediaId),
    prisma.page.findFirst({ where: { slug: "brochure" }, include: { ogImage: true } }),
  ]);

  return {
    content,
    pdf,
    page: {
      title: page?.title ?? "Brochure",
      seoTitle: page?.seoTitle ?? "Spa Furniture Brochure | Esthetica",
      metaDescription:
        page?.metaDescription ??
        "Browse the Esthetica spa furniture digital brochure and download the PDF catalogue.",
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
