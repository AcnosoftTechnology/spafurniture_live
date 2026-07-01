import { ShimmerSkeleton } from "@/components/ui/skeleton";
import { BlogPostsShimmer } from "@/components/site/blog/blog-posts-shimmer";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";

export function BlogListingPageSkeleton({ postCount = 8 }: { postCount?: number }) {
  return (
    <main className="esth-blog-page-main">
      <section className="esth-blog-hero-section">
        <EsthPageShell>
          <div className="esth-blog-hero-head" aria-hidden>
            <div className="esth-blog-hero-shimmer-wrap">
              <ShimmerSkeleton className="esth-blog-hero-shimmer-title" />
              <ShimmerSkeleton className="esth-blog-hero-shimmer-line" />
            </div>
          </div>
        </EsthPageShell>
      </section>

      <section className="esth-blog-content-section">
        <EsthPageShell>
          <div className="esth-blog-toolbar" aria-hidden>
            <ShimmerSkeleton className="esth-blog-toolbar-shimmer" />
          </div>
          <BlogPostsShimmer count={postCount} view="list" />
          <div className="esth-blog-pagination" aria-hidden>
            <ShimmerSkeleton className="h-10 w-24 rounded-sm" />
            <ShimmerSkeleton className="h-10 w-10 rounded-sm" />
            <ShimmerSkeleton className="h-10 w-10 rounded-sm" />
            <ShimmerSkeleton className="h-10 w-24 rounded-sm" />
          </div>
        </EsthPageShell>
      </section>
    </main>
  );
}
