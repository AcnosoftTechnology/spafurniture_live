"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GridProduct, ProductGridEmptyVariant } from "@/components/site/product-grid-minimal";
import {
  ProductGridCatalog,
  type FeaturedCategory,
} from "@/components/site/product-grid-catalog";
import { ProductGridShimmer } from "@/components/site/product-grid-shimmer";

const PAGE_SIZE = 12;

type ProductsPageResponse = {
  data: {
    items: GridProduct[];
    hasMore: boolean;
    nextSkip: number;
  };
};

function buildProductsApiUrl(skip: number, take: number, categorySlug?: string) {
  const params = new URLSearchParams({
    skip: String(skip),
    take: String(take),
  });
  if (categorySlug) params.set("categorySlug", categorySlug);
  return `/api/v1/products/?${params.toString()}`;
}

export function ProductsInfiniteGrid({
  initialProducts,
  initialHasMore,
  categorySlug,
  loadError: serverLoadError = null,
  emptyVariant = "category",
  featuredCategories = [],
}: {
  initialProducts: GridProduct[];
  initialHasMore: boolean;
  categorySlug?: string;
  loadError?: string | null;
  emptyVariant?: ProductGridEmptyVariant;
  featuredCategories?: FeaturedCategory[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(serverLoadError);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(initialHasMore);
  const skipRef = useRef(initialProducts.length);
  const bootstrapAttemptedRef = useRef(false);

  hasMoreRef.current = hasMore;
  skipRef.current = products.length;

  const fetchPage = useCallback(
    async (skip: number): Promise<{ items: GridProduct[]; hasMore: boolean } | null> => {
      const res = await fetch(buildProductsApiUrl(skip, PAGE_SIZE, categorySlug));
      if (!res.ok) throw new Error("Failed to load products");
      const json = (await res.json()) as ProductsPageResponse;
      return json.data;
    },
    [categorySlug],
  );

  const mergeItems = useCallback((items: GridProduct[]) => {
    setProducts((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      const merged = [...prev];
      for (const item of items) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          merged.push(item);
        }
      }
      skipRef.current = merged.length;
      return merged;
    });
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPage(skipRef.current);
      if (!data) return;

      mergeItems(data.items);
      setHasMore(data.hasMore);
      hasMoreRef.current = data.hasMore;
    } catch {
      setError("Could not load more products. Scroll again to retry.");
    } finally {
      setLoading(false);
      loadingRef.current = false;

      if (hasMoreRef.current) {
        requestAnimationFrame(() => {
          const node = sentinelRef.current;
          if (!node || loadingRef.current) return;
          const rect = node.getBoundingClientRect();
          if (rect.top <= window.innerHeight + 320) {
            void loadMore();
          }
        });
      }
    }
  }, [fetchPage, mergeItems]);

  const bootstrap = useCallback(async () => {
    if (bootstrapAttemptedRef.current) return;
    bootstrapAttemptedRef.current = true;
    setBootstrapping(true);
    setError(null);

    try {
      const data = await fetchPage(0);
      if (!data) return;

      setProducts(data.items);
      skipRef.current = data.items.length;
      setHasMore(data.hasMore);
      hasMoreRef.current = data.hasMore;
    } catch {
      setError(
        serverLoadError ??
          "Could not load products. Please check that the database is running and try again.",
      );
    } finally {
      setBootstrapping(false);
    }
  }, [fetchPage, serverLoadError]);

  useEffect(() => {
    setProducts(initialProducts);
    setHasMore(initialHasMore);
    hasMoreRef.current = initialHasMore;
    skipRef.current = initialProducts.length;
    setError(serverLoadError);
    bootstrapAttemptedRef.current = false;

    if (initialProducts.length === 0) {
      void bootstrap();
    } else {
      setBootstrapping(false);
    }
  }, [initialProducts, initialHasMore, categorySlug, serverLoadError, bootstrap]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const showInitialShimmer = bootstrapping && products.length === 0;
  const displayError = error && products.length === 0;

  return (
    <div>
      {displayError && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900" role="alert">
          {error}
        </p>
      )}

      {showInitialShimmer ? (
        <ProductGridShimmer count={8} />
      ) : (
        <ProductGridCatalog
          products={products}
          featuredCategories={featuredCategories}
          emptyVariant={emptyVariant}
        />
      )}

      {loading && products.length > 0 && (
        <>
          <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-stone-400">
            Loading more products…
          </p>
          <ProductGridShimmer count={4} />
        </>
      )}

      {error && products.length > 0 && (
        <p className="mt-4 text-center text-sm text-stone-500" role="status">
          {error}
        </p>
      )}

      {hasMore && (
        <div ref={sentinelRef} className="min-h-[100px] w-full" aria-hidden />
      )}
    </div>
  );
}

export const PRODUCTS_PAGE_SIZE = PAGE_SIZE;
