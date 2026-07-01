import { ShimmerSkeleton } from "@/components/ui/skeleton";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";

export function BlogPostDetailSkeleton() {
  return (
    <main className="esth-blog-page-main esth-blog-post-page" aria-hidden>
      <section className="esth-blog-post-hero esth-blog-post-hero--shimmer">
        <EsthPageShell>
          <ShimmerSkeleton className="esth-blog-post-shimmer-back" />
          <div className="esth-blog-post-hero-inner">
            <ShimmerSkeleton className="esth-blog-post-shimmer-title" />
            <ShimmerSkeleton className="esth-blog-post-shimmer-title esth-blog-post-shimmer-title--short" />
            <ShimmerSkeleton className="esth-blog-post-shimmer-meta" />
          </div>
        </EsthPageShell>
      </section>

      <section className="esth-blog-post-layout">
        <EsthPageShell className="esth-blog-post-grid">
          <article className="esth-blog-post-main">
            <div className="esth-blog-post-shimmer-tags">
              <ShimmerSkeleton className="esth-blog-post-shimmer-tag" />
              <ShimmerSkeleton className="esth-blog-post-shimmer-tag" />
              <ShimmerSkeleton className="esth-blog-post-shimmer-tag esth-blog-post-shimmer-tag--wide" />
            </div>

            <ShimmerSkeleton className="esth-blog-post-shimmer-featured" />

            <div className="esth-blog-post-shimmer-article">
              {Array.from({ length: 8 }).map((_, i) => (
                <ShimmerSkeleton
                  key={i}
                  className={`esth-blog-post-shimmer-line${i % 3 === 2 ? " esth-blog-post-shimmer-line--short" : ""}`}
                />
              ))}
              <ShimmerSkeleton className="esth-blog-post-shimmer-heading" />
              {Array.from({ length: 5 }).map((_, i) => (
                <ShimmerSkeleton
                  key={`b-${i}`}
                  className={`esth-blog-post-shimmer-line${i === 4 ? " esth-blog-post-shimmer-line--short" : ""}`}
                />
              ))}
            </div>
          </article>

          <aside className="esth-blog-post-sidebar esth-blog-post-shimmer-sidebar">
            <div className="esth-blog-widget">
              <ShimmerSkeleton className="esth-blog-post-shimmer-widget-title" />
              <ShimmerSkeleton className="esth-blog-post-shimmer-search" />
              <ShimmerSkeleton className="esth-blog-post-shimmer-search-btn" />
            </div>
            <div className="esth-blog-widget">
              <ShimmerSkeleton className="esth-blog-post-shimmer-widget-title" />
              {Array.from({ length: 6 }).map((_, i) => (
                <ShimmerSkeleton key={i} className="esth-blog-post-shimmer-sidebar-link" />
              ))}
            </div>
          </aside>
        </EsthPageShell>
      </section>
    </main>
  );
}
