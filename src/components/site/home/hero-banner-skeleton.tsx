import { ShimmerSkeleton } from "@/components/ui/skeleton";

export function HeroBannerSkeleton() {
  return (
    <section className="esth-premium-banner" aria-hidden>
      <div className="esth-container-fluid esth-premium-banner-shell">
        <div className="esth-premium-banner-inner">
          <div className="esth-premium-image">
            <ShimmerSkeleton className="absolute inset-0 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
