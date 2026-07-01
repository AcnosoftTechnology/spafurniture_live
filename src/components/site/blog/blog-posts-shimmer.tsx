import { ShimmerSkeleton } from "@/components/ui/skeleton";
import type { BlogViewMode } from "@/components/site/blog/blog-view";
import { cn } from "@/lib/utils";

export function BlogPostsShimmer({
  count = 12,
  view = "list",
}: {
  count?: number;
  view?: BlogViewMode;
}) {
  return (
    <div className={cn("esth-blog-posts", `esth-blog-posts--${view}`)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <article
          key={i}
          className={cn("esth-blog-card esth-blog-card--shimmer", `esth-blog-card--${view}`)}
        >
          {view === "grid" ? (
            <>
              <ShimmerSkeleton className="esth-blog-card-media-shimmer" />
              <ShimmerSkeleton className="esth-blog-card-date-shimmer" />
              <ShimmerSkeleton className="esth-blog-card-title-shimmer" />
              <ShimmerSkeleton className="esth-blog-card-excerpt-shimmer" />
              <ShimmerSkeleton className="esth-blog-card-excerpt-shimmer esth-blog-card-excerpt-shimmer--short" />
            </>
          ) : (
            <div className="esth-blog-list-shimmer-row">
              <ShimmerSkeleton className="esth-blog-list-media-shimmer" />
              <div className="esth-blog-list-body-shimmer">
                <ShimmerSkeleton className="esth-blog-list-title-shimmer" />
                <ShimmerSkeleton className="esth-blog-list-excerpt-shimmer" />
                <ShimmerSkeleton className="esth-blog-list-excerpt-shimmer" />
                <ShimmerSkeleton className="esth-blog-list-readmore-shimmer" />
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
