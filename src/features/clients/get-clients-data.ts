import { prisma } from "@/lib/prisma";
import {
  clientsPageSchema,
  defaultClientsPageContent,
  CLIENTS_SETTING_KEY,
  type ClientsPageContent,
} from "./schemas/clients-content.schema";

export type ClientsSeo = {
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

export async function getClientsContent(): Promise<ClientsPageContent> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: CLIENTS_SETTING_KEY } });
    if (!row?.value) return defaultClientsPageContent;
    return clientsPageSchema.parse(row.value);
  } catch {
    return defaultClientsPageContent;
  }
}

export async function getClientsSeo(): Promise<ClientsSeo> {
  try {
    const page = await prisma.page.findFirst({
      where: { slug: "clients" },
      include: { ogImage: true },
    });
    if (!page) {
      return {
        title: "Our Clients",
        seoTitle: "Our Clients | Trusted Spa Furniture Partner – Esthetica",
        metaDescription:
          "Esthetica supplies luxury spa furniture to leading hotels, resorts and wellness brands across India and worldwide.",
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
    return { title: "Our Clients" };
  }
}

export async function getClientsPageData() {
  const [content, seo] = await Promise.all([getClientsContent(), getClientsSeo()]);
  return { content, seo };
}

export async function saveClientsContent(content: ClientsPageContent) {
  const parsed = clientsPageSchema.parse(content);
  await prisma.siteSetting.upsert({
    where: { key: CLIENTS_SETTING_KEY },
    update: { value: parsed },
    create: { key: CLIENTS_SETTING_KEY, value: parsed },
  });
  return parsed;
}

export type AdminClientsEditorData = {
  content: ClientsPageContent;
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

export async function getAdminClientsEditorData(): Promise<AdminClientsEditorData> {
  const [content, page] = await Promise.all([
    getClientsContent(),
    prisma.page.findFirst({ where: { slug: "clients" }, include: { ogImage: true } }),
  ]);

  return {
    content,
    page: {
      title: page?.title ?? "Our Clients",
      seoTitle: page?.seoTitle ?? "Our Clients | Trusted Spa Furniture Partner – Esthetica",
      metaDescription:
        page?.metaDescription ??
        "Esthetica supplies luxury spa furniture to leading hotels, resorts and wellness brands across India and worldwide.",
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
