import { prisma } from "@/lib/prisma";
import type { ContentStatus, Prisma } from "@prisma/client";
export async function listCategories(params?: { status?: ContentStatus }) {
  return prisma.category.findMany({
    where: { status: params?.status },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: {
      thumbMedia: true,
      bannerMedia: true,
      _count: { select: { products: true } },
    },
  });
}

export async function getCategoryBySlug(slug: string, publishedOnly = true) {
  return prisma.category.findFirst({
    where: { slug, status: publishedOnly ? "PUBLISHED" : undefined },
    include: {
      bannerMedia: true,
      thumbMedia: true,
      ogImage: true,
      gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      sections: { orderBy: { sortOrder: "asc" } },
      tabs: { orderBy: { sortOrder: "asc" } },
      products: {
        where: { product: { status: publishedOnly ? "PUBLISHED" : undefined } },
        include: {
          product: {
            include: {
              gallery: { include: { media: true }, orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      bannerMedia: true,
      thumbMedia: true,
      homepageFeatureBgMedia: true,
      ogImage: true,
      gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      sections: { orderBy: { sortOrder: "asc" } },
      tabs: { orderBy: { sortOrder: "asc" } },
      products: { include: { product: true } },
    },
  });
}

export async function createCategory(data: Prisma.CategoryCreateInput) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
  return prisma.category.update({ where: { id }, data });
}

export async function getCategoryProducts(categoryId: string, tabSlug?: string) {
  const tab = tabSlug
    ? await prisma.categoryTab.findFirst({ where: { categoryId, slug: tabSlug } })
    : null;

  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      categories: { some: { categoryId } },
    },
    include: {
      gallery: { include: { media: true }, orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
  });

  return { products, tab };
}

export async function countCategories() {
  return prisma.category.count();
}

export async function listCategoriesForProductNav() {
  return prisma.category.findMany({
    where: { status: "PUBLISHED", showInProductNav: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      title: true,
      slug: true,
      sortOrder: true,
      menuLabel: true,
      homepageFeatured: true,
      homepageFeaturedSortOrder: true,
      thumbMedia: { select: { path: true } },
      bannerMedia: { select: { path: true } },
    },
  });
}
