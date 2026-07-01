import { prisma } from "@/lib/prisma";
import type { CategoryAdminPayload } from "@/types/cms";
import { Prisma, type ContentStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";

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

function categoryMediaRelations(
  data: CategoryAdminPayload,
): Pick<
  Prisma.CategoryUpdateInput,
  "bannerMedia" | "thumbMedia" | "ogImage" | "homepageFeatureBgMedia"
> {
  return {
    bannerMedia: data.bannerMediaId
      ? { connect: { id: data.bannerMediaId } }
      : { disconnect: true },
    thumbMedia: data.thumbMediaId ? { connect: { id: data.thumbMediaId } } : { disconnect: true },
    ogImage: data.ogImageId ? { connect: { id: data.ogImageId } } : { disconnect: true },
    homepageFeatureBgMedia: data.homepageFeatureBgMediaId
      ? { connect: { id: data.homepageFeatureBgMediaId } }
      : { disconnect: true },
  };
}

export async function saveCategoryAdmin(id: string | null, data: CategoryAdminPayload) {
  const status = (data.status ?? "DRAFT") as ContentStatus;
  const base: Prisma.CategoryUpdateInput = {
    title: data.title,
    slug: data.slug,
    description: data.description || null,
    homepageFeatureContent: data.homepageFeatureContent || null,
    pageContent: data.pageContent ?? undefined,
    status,
    sortOrder: data.sortOrder ?? 0,
    showInProductNav: data.showInProductNav ?? false,
    menuLabel: data.menuLabel?.trim() || null,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
    ...categoryMediaRelations(data),
    seoTitle: data.seoTitle || null,
    metaDescription: data.metaDescription || null,
    keywords: data.keywords ?? [],
    canonicalUrl: data.canonicalUrl || null,
    robots: data.robots || "index,follow",
    ogTitle: data.ogTitle || null,
    ogDescription: data.ogDescription || null,
    twitterCard: data.twitterCard || "summary_large_image",
    ...(parseSchemaJson(data.schemaJson) !== undefined
      ? { schemaJson: parseSchemaJson(data.schemaJson) }
      : {}),
  };

  return prisma.$transaction(async (tx) => {
    let categoryId = id;

    if (categoryId) {
      await tx.category.update({ where: { id: categoryId }, data: base });
      await tx.categoryGallery.deleteMany({ where: { categoryId } });
    } else {
      const created = await tx.category.create({ data: base as Prisma.CategoryCreateInput });
      categoryId = created.id;
    }

    if (data.galleryMediaIds?.length) {
      await tx.categoryGallery.createMany({
        data: data.galleryMediaIds.map((mediaId, sortOrder) => ({
          categoryId: categoryId!,
          mediaId,
          sortOrder,
        })),
      });
    }

    return tx.category.findUnique({
      where: { id: categoryId! },
      include: {
        bannerMedia: true,
        thumbMedia: true,
        homepageFeatureBgMedia: true,
        gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
        ogImage: true,
      },
    });
  });
}

export async function deleteCategoryAdmin(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, slug: true, title: true },
  });
  if (!category) throw new AppError("NOT_FOUND", "Category not found", 404);
  await prisma.category.delete({ where: { id } });
  return category;
}

export async function deleteCategoriesAdmin(ids: string[]) {
  const categories = await prisma.category.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true },
  });
  const deletableIds = categories.map((c) => c.id);
  const result = await prisma.category.deleteMany({
    where: { id: { in: deletableIds } },
  });
  return { count: result.count, slugs: categories.map((c) => c.slug) };
}
