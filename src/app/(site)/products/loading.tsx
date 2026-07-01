import { ShimmerSkeleton } from "@/components/ui/skeleton";
import { ProductGridShimmer } from "@/components/site/product-grid-shimmer";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";

export default function ProductsLoading() {
  return (
    <main className="esth-products-page-main">
      <section className="esth-products-hero-section">
        <EsthPageShell>
          <ShimmerSkeleton className="mx-auto mt-2 h-10 w-56" />
          <div className="esth-products-tabs-wrap">
            <div className="esth-products-tabs">
              {Array.from({ length: 7 }).map((_, i) => (
                <ShimmerSkeleton key={i} className="h-10 w-28" />
              ))}
            </div>
          </div>
          <div className="esth-products-grid-section">
            <ProductGridShimmer count={8} />
          </div>
        </EsthPageShell>
      </section>
    </main>
  );
}
