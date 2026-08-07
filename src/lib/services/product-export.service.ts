import { prisma } from "@/lib/prisma";
import type { ContentStatus, Prisma } from "@prisma/client";
import {
  PRODUCT_EXPORT_FIELDS,
  resolveExportFieldDefs,
  type ProductExportFieldDef,
} from "@/lib/product-export-fields";

export type ProductExportFilters = {
  status?: ContentStatus;
  ids?: string[];
  search?: string;
  /** Field keys from PRODUCT_EXPORT_FIELDS; omit = all */
  fields?: string[];
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
    primaryCategory:
      p.categories.find((pc) => pc.isPrimary)?.category ?? p.categories[0]?.category ?? null,

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

function pickProductFields(
  product: ExportedProduct,
  defs: ProductExportFieldDef[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const def of defs) {
    for (const key of def.jsonKeys) {
      out[key] = product[key as keyof ExportedProduct];
    }
  }
  return out;
}

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

export function buildProductExportJson(
  products: ExportedProduct[],
  fieldKeys?: string[],
) {
  const defs = resolveExportFieldDefs(fieldKeys);
  const allKeys = new Set(PRODUCT_EXPORT_FIELDS.flatMap((f) => f.jsonKeys));
  const selectedKeys = new Set(defs.flatMap((f) => f.jsonKeys));
  const isFull = selectedKeys.size >= allKeys.size;

  const rows = isFull
    ? products
    : products.map((p) => pickProductFields(p, defs));

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    count: rows.length,
    fields: defs.map((d) => d.key),
    products: rows,
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

type CsvGetter = (p: ExportedProduct) => unknown;

const CSV_COLUMN_GETTERS: Record<string, CsvGetter> = {
  id: (p) => p.id,
  title: (p) => p.title,
  slug: (p) => p.slug,
  status: (p) => p.status,
  featured: (p) => p.featured,
  sortOrder: (p) => p.sortOrder,
  locale: (p) => p.locale,
  publishedAt: (p) => p.publishedAt,
  createdAt: (p) => p.createdAt,
  updatedAt: (p) => p.updatedAt,
  shortDesc: (p) => p.shortDesc,
  fullDesc: (p) => p.fullDesc,
  dimensions: (p) => p.dimensions,
  priceDisplay: (p) => p.priceDisplay,
  youtubeUrl: (p) => p.youtubeUrl,
  youtubeLabel: (p) => p.youtubeLabel,
  brochureExternalUrl: (p) => p.brochureExternalUrl,
  brochureExternalLabel: (p) => p.brochureExternalLabel,
  hreflangGroupId: (p) => p.hreflangGroupId,
  categoryIds: (p) => p.categoryIds.join("|"),
  categoryTitles: (p) => p.categoryTitles.join("|"),
  primaryCategoryId: (p) => p.primaryCategory?.id ?? "",
  primaryCategoryTitle: (p) => p.primaryCategory?.title ?? "",
  galleryMediaIds: (p) => p.gallery.map((g) => g.mediaId).join("|"),
  galleryPaths: (p) => p.gallery.map((g) => g.path).join("|"),
  dimensionsMediaId: (p) => p.dimensionsMedia?.mediaId ?? "",
  dimensionsMediaPath: (p) => p.dimensionsMedia?.path ?? "",
  featuresMediaId: (p) => p.featuresMedia?.mediaId ?? "",
  featuresMediaPath: (p) => p.featuresMedia?.path ?? "",
  brochureMediaId: (p) => p.brochureMedia?.mediaId ?? "",
  brochureMediaPath: (p) => p.brochureMedia?.path ?? "",
  ogImageId: (p) => p.ogImage?.mediaId ?? "",
  ogImagePath: (p) => p.ogImage?.path ?? "",
  features: (p) => p.features,
  attributes: (p) => p.attributes,
  sections: (p) => p.sections,
  tabs: (p) => p.tabs,
  relatedProductIds: (p) => p.relatedProducts.map((r) => r.id).join("|"),
  relatedProductSlugs: (p) => p.relatedProducts.map((r) => r.slug).join("|"),
  seoTitle: (p) => p.seo.seoTitle,
  metaDescription: (p) => p.seo.metaDescription,
  keywords: (p) => p.seo.keywords.join("|"),
  canonicalUrl: (p) => p.seo.canonicalUrl,
  robots: (p) => p.seo.robots,
  ogTitle: (p) => p.seo.ogTitle,
  ogDescription: (p) => p.seo.ogDescription,
  twitterCard: (p) => p.seo.twitterCard,
  schemaJson: (p) => p.seo.schemaJson,
};

/** Flat spreadsheet-friendly rows; columns follow selected fields. */
export function buildProductExportCsv(
  products: ExportedProduct[],
  fieldKeys?: string[],
): string {
  const defs = resolveExportFieldDefs(fieldKeys);
  const headers = defs.flatMap((d) => d.csvColumns);
  const lines = [headers.join(",")];

  for (const p of products) {
    const row = headers.map((col) => {
      const getter = CSV_COLUMN_GETTERS[col];
      return csvEscape(getter ? getter(p) : "");
    });
    lines.push(row.join(","));
  }

  return `\uFEFF${lines.join("\n")}`;
}
