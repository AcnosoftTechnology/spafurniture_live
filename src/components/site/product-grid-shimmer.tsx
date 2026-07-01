import { ShimmerSkeleton } from "@/components/ui/skeleton";

export function ProductGridShimmer({ count = 4 }: { count?: number }) {
  return (
    <div className="esth-products-grid" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="esth-products-grid-cell">
          <ShimmerSkeleton className="esth-products-shimmer-card" />
        </div>
      ))}
    </div>
  );
}
