import { prisma } from "@/lib/prisma";
import type { ContentStatus, Prisma } from "@prisma/client";

export type ProductExportFilters = {
  status?: ContentStatus;
  ids?: string[];
  search?: string;
};

function mediaRef(
  media:
    | {
        id: string;
        path: string;
        webpPath?: string | null;
        filename?: string | null;
        alt?: string | null;
        cdnUrl?: string | null;
      }
    | null
    | undefined,
) {
  if (!media) return null;
  return {
    mediaId: media.id,
    path: media.path,
    webpPath: media.webpPath ?? null,
    filename: media.filename ?? null,
    alt: media.alt ?? null,
    cdnUrl: media.cdnUrl ?? null,
  };
}

const exportInclude = {
  categories: {
    include: {
      category: {
        select: { id: true, title: true, slug: true },
      },
    },
  },
  features: { orderBy: { sortOrder: "asc" as const } },
  attributes: true,
  gallery: {
    include: { media: true },
    orderBy: { sortOrder: "asc" as const },
  },
  sections: { orderBy: { sortOrder: "asc" as const } },
  tabs: { orderBy: { sortOrder: "asc" as const } },
  relatedFrom: {
    include: {
      relatedProduct: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { sortOrder: "asc" as const },
  },
  brochureMedia: true,
  dimensionsMedia: true,
  featuresMedia: true,
  ogImage: true,
} satisfies Prisma.ProductInclude;

type ProductExportRow = Prisma.ProductGetPayload<{ include: typeof exportInclude }>;

function mapProduct(p: ProductExportRow) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    featured: p.featured,
    sortOrder: p.sortOrder,
    locale: p.locale,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),

    shortDesc: p.shortDesc,
    fullDesc: p.fullDesc,
    dimensions: p.dimensions,
    priceDisplay: p.priceDisplay,
    youtubeUrl: p.youtubeUrl,
    youtubeLabel: p.youtubeLabel,
    brochureExternalUrl: p.brochureExternalUrl,
    brochureExternalLabel: p.brochureExternalLabel,
    hreflangGroupId: p.hreflangGroupId,

    categories: p.categories.map((pc) => ({
      id: pc.category.id,
      title: pc.category.title,
      slug: pc.category.slug,
      isPrimary: pc.isPrimary,
    })),
    categoryIds: p.categories.map((pc) => pc.category.id),
    categoryTitles: p.categories.map((pc) => pc.category.title),
    primaryCategory: p.categories.find((pc) => pc.isPrimary)?.category ?? p.categories[0]?.category ?? null,

    gallery: p.gallery.map((g) => ({
      mediaId: g.mediaId,
      sortOrder: g.sortOrder,
      ...mediaRef(g.media),
    })),
    dimensionsMedia: mediaRef(p.dimensionsMedia),
    featuresMedia: mediaRef(p.featuresMedia),
    brochureMedia: mediaRef(p.brochureMedia),
    ogImage: mediaRef(p.ogImage),

    features: p.features.map((f) => ({
      id: f.id,
      label: f.label,
      value: f.value,
      sortOrder: f.sortOrder,
    })),
    attributes: p.attributes.map((a) => ({
      id: a.id,
      key: a.key,
      value: a.value,
    })),
    sections: p.sections.map((s) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      content: s.content,
      sortOrder: s.sortOrder,
    })),
    tabs: p.tabs.map((t) => ({
      id: t.id,
      label: t.label,
      content: t.content,
      sortOrder: t.sortOrder,
    })),
    relatedProducts: p.relatedFrom.map((r) => ({
      id: r.relatedProduct.id,
      title: r.relatedProduct.title,
      slug: r.relatedProduct.slug,
      sortOrder: r.sortOrder,
    })),

    seo: {
      seoTitle: p.seoTitle,
      metaDescription: p.metaDescription,
      keywords: p.keywords,
      canonicalUrl: p.canonicalUrl,
      robots: p.robots,
      ogTitle: p.ogTitle,
      ogDescription: p.ogDescription,
      ogImageId: p.ogImageId,
      twitterCard: p.twitterCard,
      schemaJson: p.schemaJson,
    },
  };
}

export type ExportedProduct = ReturnType<typeof mapProduct>;

export async function fetchProductsForExport(filters: ProductExportFilters = {}) {
  const where: Prisma.ProductWhereInput = {};

  if (filters.status) where.status = filters.status;
  if (filters.ids?.length) where.id = { in: filters.ids };
  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { seoTitle: { contains: q, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: exportInclude,
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return products.map(mapProduct);
}

export function buildProductExportJson(products: ExportedProduct[]) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    count: products.length,
    products,
  };
}

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const str =
    typeof value === "string"
      ? value
      : typeof value === "number" || typeof value === "boolean"
        ? String(value)
        : JSON.stringify(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/** Flat spreadsheet-friendly rows (fullDesc / schemaJson as JSON strings). */
export function buildProductExportCsv(products: ExportedProduct[]): string {
  const headers = [
    "id",
    "title",
    "slug",
    "status",
    "featured",
    "sortOrder",
    "locale",
    "publishedAt",
    "createdAt",
    "updatedAt",
    "shortDesc",
    "fullDesc",
    "dimensions",
    "priceDisplay",
    "youtubeUrl",
    "youtubeLabel",
    "brochureExternalUrl",
    "brochureExternalLabel",
    "categoryIds",
    "categoryTitles",
    "primaryCategoryId",
    "primaryCategoryTitle",
    "galleryMediaIds",
    "galleryPaths",
    "dimensionsMediaId",
    "dimensionsMediaPath",
    "featuresMediaId",
    "featuresMediaPath",
    "brochureMediaId",
    "brochureMediaPath",
    "ogImageId",
    "ogImagePath",
    "features",
    "attributes",
    "relatedProductIds",
    "relatedProductSlugs",
    "seoTitle",
    "metaDescription",
    "keywords",
    "canonicalUrl",
    "robots",
    "ogTitle",
    "ogDescription",
    "twitterCard",
    "schemaJson",
  ];

  const lines = [headers.join(",")];

  for (const p of products) {
    const row = [
      p.id,
      p.title,
      p.slug,
      p.status,
      p.featured,
      p.sortOrder,
      p.locale,
      p.publishedAt,
      p.createdAt,
      p.updatedAt,
      p.shortDesc,
      p.fullDesc,
      p.dimensions,
      p.priceDisplay,
      p.youtubeUrl,
      p.youtubeLabel,
      p.brochureExternalUrl,
      p.brochureExternalLabel,
      p.categoryIds.join("|"),
      p.categoryTitles.join("|"),
      p.primaryCategory?.id ?? "",
      p.primaryCategory?.title ?? "",
      p.gallery.map((g) => g.mediaId).join("|"),
      p.gallery.map((g) => g.path).join("|"),
      p.dimensionsMedia?.mediaId ?? "",
      p.dimensionsMedia?.path ?? "",
      p.featuresMedia?.mediaId ?? "",
      p.featuresMedia?.path ?? "",
      p.brochureMedia?.mediaId ?? "",
      p.brochureMedia?.path ?? "",
      p.ogImage?.mediaId ?? "",
      p.ogImage?.path ?? "",
      p.features,
      p.attributes,
      p.relatedProducts.map((r) => r.id).join("|"),
      p.relatedProducts.map((r) => r.slug).join("|"),
      p.seo.seoTitle,
      p.seo.metaDescription,
      p.seo.keywords.join("|"),
      p.seo.canonicalUrl,
      p.seo.robots,
      p.seo.ogTitle,
      p.seo.ogDescription,
      p.seo.twitterCard,
      p.seo.schemaJson,
    ];
    lines.push(row.map(csvEscape).join(","));
  }

  return `\uFEFF${lines.join("\n")}`;
}
