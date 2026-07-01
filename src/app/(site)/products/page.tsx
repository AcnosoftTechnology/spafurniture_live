import { countProducts, listProducts } from "@/lib/services/product.service";
import { listCategoriesForProductNav } from "@/lib/services/category.service";
import { buildProductNavCategories } from "@/lib/product-nav-categories";
import { CategoryNav } from "@/components/site/category-nav";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import { JsonLd } from "@/components/site/seo/json-ld";
import {
  ProductsInfiniteGrid,
  PRODUCTS_PAGE_SIZE,
} from "@/components/site/products-infinite-grid";
import { ProductsIndexCatalog } from "@/components/site/products-index-catalog";
import { buildProductsIndexSchemas } from "@/lib/seo/build-schemas";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getProductsIndexLayout,
  resolveFeaturedCategories,
  resolveManualSections,
} from "@/features/products-index/get-products-index-data";
import type { GridProduct } from "@/components/site/product-grid-minimal";

export const revalidate = 3600;

export async function generateMetadata() {
  return buildPageMetadata({
    title: "Our Products",
    seoTitle: "Buy Spa & Salon Furniture Online | Esthetica",
    metaDescription:
      "Browse Esthetica's complete range of spa massage beds, salon furniture, stools, carts and accessories. Worldwide shipping. Enquire for pricing.",
  }, "/products/");
}

export default async function ProductsPage() {
  let gridProducts: GridProduct[] = [];
  let categories: Awaited<ReturnType<typeof listCategoriesForProductNav>> = [];
  let hasMore = false;
  let loadError: string | null = null;
  let categoriesError: string | null = null;
  let layout = await getProductsIndexLayout();
  let manualSections: Awaited<ReturnType<typeof resolveManualSections>> | null = null;

  try {
    categories = await listCategoriesForProductNav();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[ProductsPage] Failed to load categories:", err);
    }
    categoriesError = "Categories could not be loaded.";
  }

  if (layout.mode === "manual") {
    try {
      manualSections = await resolveManualSections(layout.blocks);
      const seen = new Set<string>();
      gridProducts = [];
      for (const section of manualSections) {
        const items = section.type === "grid" ? section.products : section.products;
        for (const p of items) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            gridProducts.push(p);
          }
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[ProductsPage] Failed to load manual layout:", err);
      }
      loadError = "Unable to load products layout.";
    }
  } else {
    try {
      const [products, total] = await Promise.all([
        listProducts({ status: "PUBLISHED", take: PRODUCTS_PAGE_SIZE, skip: 0 }),
        countProducts({ status: "PUBLISHED" }),
      ]);
      gridProducts = products.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        imagePath: p.gallery[0]?.media?.path,
      }));
      hasMore = gridProducts.length < total;
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[ProductsPage] Failed to load products:", err);
      }
      loadError = "Unable to load products. Please check that the database is running and try again.";
    }
  }

  let featuredCategories: Awaited<ReturnType<typeof resolveFeaturedCategories>>;
  if (layout.mode === "auto" && layout.featuredCategoryIds.length > 0) {
    featuredCategories = await resolveFeaturedCategories(layout.featuredCategoryIds);
  } else if (layout.mode === "auto") {
    featuredCategories = categories.map((c) => ({
      title: c.menuLabel?.trim() || c.title,
      slug: c.slug,
      imagePath: c.bannerMedia?.path ?? c.thumbMedia?.path ?? null,
    }));
  } else {
    featuredCategories = [];
  }

  const schemaScript = await buildProductsIndexSchemas(gridProducts);

  return (
    <>
      <JsonLd data={schemaScript} />
      <main className="esth-products-page-main">
      <section className="esth-products-hero-section">
        <EsthPageShell>
          <div className="esth-products-hero-head">
            <h1>Our Products</h1>
          </div>

          <CategoryNav
            categories={buildProductNavCategories(categories)}
          />
          {categoriesError && (
            <p className="mt-2 text-center text-sm text-amber-800">{categoriesError}</p>
          )}

          <div className="esth-products-grid-section">
            {layout.mode === "manual" && manualSections ? (
              <ProductsIndexCatalog sections={manualSections} />
            ) : (
              <ProductsInfiniteGrid
                initialProducts={gridProducts}
                initialHasMore={hasMore}
                loadError={loadError}
                emptyVariant="all"
                featuredCategories={featuredCategories}
              />
            )}
          </div>
        </EsthPageShell>
      </section>
    </main>
    </>
  );
}
