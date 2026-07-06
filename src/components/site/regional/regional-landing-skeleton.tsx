import { EsthContainer } from "@/components/site/layout/esth-container";
import { ShimmerSkeleton } from "@/components/ui/skeleton";

export function RegionalLandingSkeleton({ slug }: { slug: string }) {
  return (
    <>
      <section
        className="esth-premium-banner esth-premium-banner--regional esth-regional-banner--shimmer"
        id={slug}
        aria-hidden
      >
        <div className="esth-premium-banner-shell">
          <div className="esth-premium-banner-inner">
            <ShimmerSkeleton className="esth-regional-banner-shimmer-center" />
          </div>
        </div>
      </section>

      <section className="esth-regional-intro-section esth-regional-intro-section--shimmer" aria-hidden>
        <EsthContainer>
          <div className="esth-regional-intro-shimmer">
            <ShimmerSkeleton className="esth-regional-intro-shimmer-title" />
            <ShimmerSkeleton className="esth-regional-intro-shimmer-line" />
            <ShimmerSkeleton className="esth-regional-intro-shimmer-line" />
            <ShimmerSkeleton className="esth-regional-intro-shimmer-line esth-regional-intro-shimmer-line--short" />
            <ShimmerSkeleton className="esth-regional-intro-shimmer-btn" />
          </div>
        </EsthContainer>
      </section>
    </>
  );
}
