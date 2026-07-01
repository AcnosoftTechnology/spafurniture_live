import { prisma } from "@/lib/prisma";
import type { ContentStatus, Prisma } from "@prisma/client";

export type ListProductsParams = {
  status?: ContentStatus;
  categoryId?: string;
  featured?: boolean;
  search?: string;
  skip?: number;
  take?: number;
};

function buildProductWhere(params?: ListProductsParams): Prisma.ProductWhereInput {
  return {
    status: params?.status,
    featured: params?.featured,
    OR: params?.search
      ? [
          { title: { contains: params.search, mode: "insensitive" } },
          { slug: { contains: params.search, mode: "insensitive" } },
        ]
      : undefined,
    categories: params?.categoryId
      ? { some: { categoryId: params.categoryId } }
      : undefined,
  };
}

// export async function listProducts(params?: ListProductsParams) {
//   return prisma.product.findMany({
//     where: buildProductWhere(params),
//     orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
//     skip: params?.skip ?? 0,
//     // take: params?.take ?? 50,
//     take: Number(params?.take ?? 50),

//     include: {
//       categories: { include: { category: true } },
//       gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
//       brochureMedia: true,
//     },
//   });
// }

export async function listProducts(params?: ListProductsParams) {
  const take =
    typeof params?.take === "number"
      ? params.take
      : 50;

  const skip =
    typeof params?.skip === "number"
      ? params.skip
      : 0;

  return prisma.product.findMany({
    where: buildProductWhere(params),

    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],

    skip,
    take,

    include: {
      categories: {
        include: {
          category: true,
        },
      },

      gallery: {
        include: {
          media: true,
        },

        orderBy: {
          sortOrder: "asc",
        },
      },

      brochureMedia: true,
    },
  });
}

export async function getProductBySlug(slug: string, publishedOnly = true) {
  return prisma.product.findFirst({
    where: {
      slug,
      status: publishedOnly ? "PUBLISHED" : undefined,
    },
    include: {
      categories: { include: { category: true } },
      features: { orderBy: { sortOrder: "asc" } },
      attributes: true,
      gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      sections: { orderBy: { sortOrder: "asc" } },
      tabs: { orderBy: { sortOrder: "asc" } },
      brochureMedia: true,
      dimensionsMedia: true,
      featuresMedia: true,
      ogImage: true,
      reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" } },
      relatedFrom: {
        include: { relatedProduct: { include: { gallery: { include: { media: true }, take: 1 } } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      categories: true,
      features: { orderBy: { sortOrder: "asc" } },
      attributes: true,
      gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      sections: { orderBy: { sortOrder: "asc" } },
      tabs: { orderBy: { sortOrder: "asc" } },
      relatedFrom: { include: { relatedProduct: true } },
      brochureMedia: true,
      dimensionsMedia: true,
      featuresMedia: true,
      ogImage: true,
    },
  });
}

export async function createProduct(data: Prisma.ProductCreateInput) {
  return prisma.product.create({ data });
}

export async function updateProduct(id: string, data: Prisma.ProductUpdateInput) {
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

export async function countProducts(params?: ListProductsParams) {
  return prisma.product.count({ where: buildProductWhere(params) });
}

/** Next published product in catalogue order (wraps to first). */
export async function getNextPublishedProduct(slug: string) {
  // Current product ki categories nikalo
  const currentProduct = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      categories: {
        select: {
          categoryId: true,
        },
      },
    },
  });

  if (!currentProduct) return null;

  const categoryIds = currentProduct.categories.map((c) => c.categoryId);

  if (!categoryIds.length) return null;

  // Sirf same category ke products lao
  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      categories: {
        some: {
          categoryId: {
            in: categoryIds,
          },
        },
      },
    },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      slug: true,
      title: true,
      gallery: {
        take: 1,
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          media: {
            select: {
              path: true,
            },
          },
        },
      },
    },
  });

  if (products.length < 2) return null;

  const index = products.findIndex((p) => p.slug === slug);

  const next = products[(index + 1) % products.length];

  if (!next || next.slug === slug) return null;

  return {
    slug: next.slug,
    title: next.title,
    imagePath: next.gallery[0]?.media.path ?? null,
  };
}

export async function deleteProducts(ids: string[]) {
  if (!ids.length) return { count: 0 };
  return prisma.product.deleteMany({ where: { id: { in: ids } } });
}
