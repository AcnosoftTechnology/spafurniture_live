"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { mediaUrl } from "@/lib/utils";
import { categoryPath } from "@/lib/paths";
import { ProductCatalogCard } from "@/components/site/product-catalog-card";
import type { GridProduct, ProductGridEmptyVariant } from "@/components/site/product-grid-minimal";

export type FeaturedCategory = {
  title: string;
  slug: string;
  imagePath?: string | null;
};

const PRODUCTS_PER_BLOCK = 20;
/** Products shown beside the category featured card; rest flow in full-width grid below. */
const FEATURED_COMPANION_COUNT = 4;

type GridSection =
  | { type: "grid"; products: GridProduct[] }
  | {
      type: "featured";
      side: "left" | "right";
      category: FeaturedCategory;
      products: GridProduct[];
    };

export type { GridSection };

function buildSections(
  products: GridProduct[],
  categories: FeaturedCategory[],
): GridSection[] {
  const sections: GridSection[] = [];
  let productIndex = 0;
  let categoryIndex = 0;
  let side: "left" | "right" = "left";

  while (productIndex < products.length) {
    const gridBatch = products.slice(productIndex, productIndex + PRODUCTS_PER_BLOCK);
    productIndex += gridBatch.length;
    if (gridBatch.length > 0) {
      sections.push({ type: "grid", products: gridBatch });
    }

    if (
      productIndex < products.length &&
      categoryIndex < categories.length &&
      gridBatch.length === PRODUCTS_PER_BLOCK
    ) {
      const companions = products.slice(productIndex, productIndex + FEATURED_COMPANION_COUNT);
      productIndex += companions.length;
      sections.push({
        type: "featured",
        side,
        category: categories[categoryIndex],
        products: companions,
      });
      categoryIndex += 1;
      side = side === "left" ? "right" : "left";
    }
  }

  return sections;
}

function FeaturedCategoryCard({ category }: { category: FeaturedCategory }) {
  return (
    <Link
      href={categoryPath(category.slug)}
      className={`esth-products-featured-card esth-products-featured-card-link`}
    >
      <div className="esth-products-featured-image-wrap">
        <Image
          src={mediaUrl(category.imagePath)}
          alt={category.title}
          fill
          className="object-contain p-6"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="esth-products-featured-label">
        <span>{category.title}</span>
      </div>
    </Link>
  );
}

function StandardGrid({ products }: { products: GridProduct[] }) {
  return (
    <div className="esth-products-grid">
      {products.map((product) => (
        <div key={product.id} className="esth-products-grid-cell">
          <ProductCatalogCard product={product} />
        </div>
      ))}
    </div>
  );
}

function FeaturedRow({
  side,
  category,
  products,
}: {
  side: "left" | "right";
  category: FeaturedCategory;
  products: GridProduct[];
}) {
  const companionProducts = products.slice(0, FEATURED_COMPANION_COUNT);
  const overflowProducts = products.slice(FEATURED_COMPANION_COUNT);

  return (
    <div className="esth-products-featured-block">
      <div className={`esth-products-featured-row esth-products-featured-row--${side}`}>
        {side === "left" && <FeaturedCategoryCard category={category} />}
        <div className="esth-products-companion-grid">
          {companionProducts.map((product) => (
            <ProductCatalogCard key={product.id} product={product} />
          ))}
        </div>
        {side === "right" && <FeaturedCategoryCard category={category} />}
      </div>
      {overflowProducts.length > 0 && <StandardGrid products={overflowProducts} />}
    </div>
  );
}

const EMPTY_COPY: Record<ProductGridEmptyVariant, { title: string; hint?: string }> = {
  all: {
    title: "No products found",
    hint: "Publish products in the admin panel or run the spadata import if your catalogue is empty.",
  },
  category: {
    title: "No products in this category yet",
    hint: "Try browsing all products or choose another category.",
  },
};

export function ProductGridCatalog({
  products,
  featuredCategories = [],
  sections: sectionsOverride,
  emptyVariant = "category",
}: {
  products: GridProduct[];
  featuredCategories?: FeaturedCategory[];
  sections?: GridSection[];
  emptyVariant?: ProductGridEmptyVariant;
}) {
  const sections = useMemo(
    () => sectionsOverride ?? buildSections(products, featuredCategories),
    [sectionsOverride, products, featuredCategories],
  );

  if (sections.length === 0 && products.length === 0) {
    const copy = EMPTY_COPY[emptyVariant];
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium text-stone-600">{copy.title}</p>
        {copy.hint && <p className="mt-2 text-sm text-stone-500">{copy.hint}</p>}
      </div>
    );
  }

  return (
    <div className="esth-products-catalog">
      {sections.map((section, index) => {
        if (section.type === "grid") {
          return <StandardGrid key={`grid-${index}`} products={section.products} />;
        }
        return (
          <FeaturedRow
            key={`featured-${section.category.slug}-${index}`}
            side={section.side}
            category={section.category}
            products={section.products}
          />
        );
      })}
    </div>
  );
}
