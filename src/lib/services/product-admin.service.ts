import { prisma } from "@/lib/prisma";
import type { ProductAdminPayload } from "@/types/cms";
import { Prisma, type ContentStatus } from "@prisma/client";

function parseSchemaJson(raw: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (raw === undefined) return undefined;
  if (raw === null || raw === "") return Prisma.JsonNull;
  if (typeof raw === "object") return raw as Prisma.InputJsonValue;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Prisma.InputJsonValue;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function seoData(data: ProductAdminPayload): Prisma.ProductUpdateInput {
  const schema = parseSchemaJson(data.schemaJson);
  return {
    seoTitle: data.seoTitle || null,
    metaDescription: data.metaDescription || null,
    keywords: data.keywords ?? [],
    canonicalUrl: data.canonicalUrl || null,
    robots: data.robots || "index,follow",
    ogTitle: data.ogTitle || null,
    ogDescription: data.ogDescription || null,
    ogImage: data.ogImageId ? { connect: { id: data.ogImageId } } : { disconnect: true },
    twitterCard: data.twitterCard || "summary_large_image",
    ...(schema !== undefined ? { schemaJson: schema } : {}),
  };
}

export async function saveProductAdmin(id: string | null, data: ProductAdminPayload) {
  const status = (data.status ?? "DRAFT") as ContentStatus;
  const base: Prisma.ProductUpdateInput = {
    title: data.title,
    slug: data.slug,
    shortDesc: data.shortDesc || null,
    dimensions: data.dimensions || null,
    fullDesc: data.fullDesc ?? undefined,
    priceDisplay: data.priceDisplay || null,
    featured: data.featured ?? false,
    status,
    sortOrder: data.sortOrder ?? 0,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
    brochureMedia:
      data.brochureMediaId
        ? { connect: { id: data.brochureMediaId } }
        : { disconnect: true },
    brochureExternalUrl: data.brochureMediaId ? null : data.brochureExternalUrl?.trim() || null,
    brochureExternalLabel: data.brochureMediaId ? null : data.brochureExternalLabel?.trim() || null,
    youtubeUrl: data.youtubeUrl?.trim() || null,
    youtubeLabel: data.youtubeLabel?.trim() || null,
    dimensionsMedia:
      data.dimensionsMediaId
        ? { connect: { id: data.dimensionsMediaId } }
        : { disconnect: true },
    featuresMedia:
      data.featuresMediaId
        ? { connect: { id: data.featuresMediaId } }
        : { disconnect: true },
    ...seoData(data),
  };

  return prisma.$transaction(async (tx) => {
    let productId = id;

    if (productId) {
      await tx.product.update({ where: { id: productId }, data: base });
      await tx.productCategory.deleteMany({ where: { productId } });
      await tx.productGallery.deleteMany({ where: { productId } });
      await tx.productFeature.deleteMany({ where: { productId } });
      await tx.productAttribute.deleteMany({ where: { productId } });
    } else {
      const created = await tx.product.create({
        data: base as Prisma.ProductCreateInput,
      });
      productId = created.id;
    }

    if (data.categoryIds?.length) {
      await tx.productCategory.createMany({
        data: data.categoryIds.map((categoryId, i) => ({
          productId: productId!,
          categoryId,
          isPrimary: i === 0,
        })),
      });
    }

    if (data.galleryMediaIds?.length) {
      await tx.productGallery.createMany({
        data: data.galleryMediaIds.map((mediaId, sortOrder) => ({
          productId: productId!,
          mediaId,
          sortOrder,
        })),
      });
    }

    if (data.features?.length) {
      await tx.productFeature.createMany({
        data: data.features.map((f, sortOrder) => ({
          productId: productId!,
          label: f.label,
          value: f.value,
          sortOrder,
        })),
      });
    }

    if (data.attributes?.length) {
      await tx.productAttribute.createMany({
        data: data.attributes.map((a) => ({
          productId: productId!,
          key: a.key,
          value: a.value,
        })),
      });
    }

    return tx.product.findUnique({
      where: { id: productId! },
      include: {
        gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
        categories: { include: { category: true } },
        features: { orderBy: { sortOrder: "asc" } },
        attributes: true,
        brochureMedia: true,
        dimensionsMedia: true,
        featuresMedia: true,
        ogImage: true,
      },
    });
  });
}
