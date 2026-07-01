"use client";

import { ProductGridCatalog, type GridSection } from "@/components/site/product-grid-catalog";

export function ProductsIndexCatalog({
  sections,
}: {
  sections: GridSection[];
}) {
  return (
    <ProductGridCatalog
      sections={sections}
      products={[]}
      emptyVariant="all"
    />
  );
}
