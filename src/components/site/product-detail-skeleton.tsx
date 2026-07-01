import { ShimmerSkeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="detailShell detailShell--shimmer" aria-hidden>
      <div className="detailMainSection">
        <div className="detailContainer">
          <ShimmerSkeleton className="detailShimmerPager" />
          <div className="detailContentGrid">
            <div className="detailVisualPanel">
              <ShimmerSkeleton className="detailShimmerImage" />
              <div className="detailShimmerThumbs">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ShimmerSkeleton key={i} className="detailShimmerThumb" />
                ))}
              </div>
            </div>

            <div className="detailInfoPanel">
              <ShimmerSkeleton className="detailShimmerEyebrow" />
              <ShimmerSkeleton className="detailShimmerTitle" />
              <ShimmerSkeleton className="detailShimmerTitle detailShimmerTitle--short" />
              <div className="detailShimmerAccordion">
                <ShimmerSkeleton className="detailShimmerAccordionRow" />
                <ShimmerSkeleton className="detailShimmerAccordionRow" />
                <ShimmerSkeleton className="detailShimmerAccordionRow" />
              </div>
              <ShimmerSkeleton className="detailShimmerButton" />
              <ShimmerSkeleton className="detailShimmerButton" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
