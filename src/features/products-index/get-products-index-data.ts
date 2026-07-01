import { prisma } from "@/lib/prisma";
import type { GridProduct } from "@/components/site/product-grid-minimal";
import type { FeaturedCategory } from "@/components/site/product-grid-catalog";
import type { GridSection } from "@/components/site/product-grid-catalog";
import {
  defaultProductsIndexLayout,
  PRODUCTS_INDEX_SETTING_KEY,
  productsIndexLayoutSchema,
  type ProductsIndexBlock,
  type ProductsIndexLayout,
} from "@/features/products-index/schemas/products-index-layout.schema";

export async function getProductsIndexLayout(): Promise<ProductsIndexLayout> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: PRODUCTS_INDEX_SETTING_KEY } });
    if (!row?.value) return defaultProductsIndexLayout;
    return productsIndexLayoutSchema.parse(row.value);
  } catch {
    return defaultProductsIndexLayout;
  }
}

export async function saveProductsIndexLayout(layout: ProductsIndexLayout) {
  const parsed = productsIndexLayoutSchema.parse(layout);
  await prisma.siteSetting.upsert({
    where: { key: PRODUCTS_INDEX_SETTING_KEY },
    update: { value: parsed },
    create: { key: PRODUCTS_INDEX_SETTING_KEY, value: parsed },
  });
  return parsed;
}

function mapGridProduct(p: {
  id: string;
  title: string;
  slug: string;
  gallery: { media: { path: string } }[];
}): GridProduct {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    imagePath: p.gallery[0]?.media?.path ?? undefined,
  };
}

export async function listGridProductsByIds(ids: string[]): Promise<GridProduct[]> {
  if (!ids.length) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    include: {
      gallery: { include: { media: true }, orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });
  const byId = new Map(products.map((p) => [p.id, mapGridProduct(p)]));
  return ids.map((id) => byId.get(id)).filter((p): p is GridProduct => Boolean(p));
}

export async function resolveFeaturedCategories(
  categoryIds: string[],
): Promise<FeaturedCategory[]> {
  if (!categoryIds.length) return [];
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds }, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      menuLabel: true,
      thumbMedia: { select: { path: true } },
      bannerMedia: { select: { path: true } },
    },
  });
  const byId = new Map(categories.map((c) => [c.id, c]));
  return categoryIds
    .map((id) => byId.get(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({
      title: c.menuLabel?.trim() || c.title,
      slug: c.slug,
      imagePath: c.bannerMedia?.path ?? c.thumbMedia?.path ?? null,
    }));
}

export async function resolveManualSections(blocks: ProductsIndexBlock[]): Promise<GridSection[]> {
  const sections: GridSection[] = [];

  for (const block of blocks) {
    if (block.type === "grid") {
      const products = await listGridProductsByIds(block.productIds);
      if (products.length) sections.push({ type: "grid", products });
      continue;
    }

    const [categoryRow] = await resolveFeaturedCategories([block.categoryId]);
    if (!categoryRow) continue;
    const products = await listGridProductsByIds(block.productIds);
    if (!products.length) continue;

    sections.push({
      type: "featured",
      side: block.side,
      category: categoryRow,
      products,
    });
  }

  return sections;
}

export type AdminProductsIndexEditorData = {
  layout: ProductsIndexLayout;
  navCategories: Array<{
    id: string;
    title: string;
    slug: string;
    showInProductNav: boolean;
  }>;
  products: Array<{ id: string; title: string; slug: string; status: string }>;
};

export async function getAdminProductsIndexEditorData(): Promise<AdminProductsIndexEditorData> {
  const [layout, navCategories, products] = await Promise.all([
    getProductsIndexLayout(),
    prisma.category.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, title: true, slug: true, showInProductNav: true },
    }),
    prisma.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, title: true, slug: true, status: true },
      take: 500,
    }),
  ]);

  return { layout, navCategories, products };
}
