import { Suspense } from "react";
import { redirect } from "next/navigation";
import { listPosts, countBlogPosts } from "@/lib/services/blog.service";
import { blogArchivePathFromKey } from "@/lib/blog-archive";
import { blogIndexPath } from "@/lib/blog-paths";
import { BLOG_PAGE_SIZE } from "@/lib/blog-constants";
import { BlogListing } from "@/components/site/blog/blog-listing";
import { BlogPagination } from "@/components/site/blog/blog-pagination";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import { ShimmerSkeleton } from "@/components/ui/skeleton";

type BlogListingPageProps = {
  heroTitle: string;
  archive?: string;
  tagSlug?: string;
  categorySlug?: string;
  paginationBasePath?: string;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export async function BlogListingPage({
  heroTitle,
  archive,
  tagSlug,
  categorySlug,
  paginationBasePath,
  searchParams,
}: BlogListingPageProps) {
  const { q, page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const skip = (currentPage - 1) * BLOG_PAGE_SIZE;
  const basePath =
    paginationBasePath ??
    (archive ? (blogArchivePathFromKey(archive) ?? blogIndexPath()) : blogIndexPath());

  let posts: Awaited<ReturnType<typeof listPosts>> = [];
  let total = 0;

  try {
    [posts, total] = await Promise.all([
      listPosts({
        status: "PUBLISHED",
        search: q,
        archive,
        tagSlug,
        categorySlug,
        skip,
        take: BLOG_PAGE_SIZE,
      }),
      countBlogPosts({ status: "PUBLISHED", search: q, archive, tagSlug, categorySlug }),
    ]);
  } catch {
    // empty
  }

  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));

  if (total > 0 && currentPage > totalPages) {
    const params = new URLSearchParams();
    if (totalPages > 1) params.set("page", String(totalPages));
    if (q) params.set("q", q);
    const qs = params.toString();
    redirect(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <main className="esth-blog-page-main">
      <section className="esth-blog-hero-section">
        <EsthPageShell>
          <div className="esth-blog-hero-head">
            <h1 className="esth-blog-hero-title">{heroTitle}</h1>
          </div>
        </EsthPageShell>
      </section>

      <section className="esth-blog-content-section">
        <EsthPageShell>
          <BlogListing
            posts={posts.map((post) => ({
              id: post.id,
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              publishedAt: post.publishedAt?.toISOString() ?? null,
              featuredMedia: post.featuredMedia
                ? {
                    path: post.featuredMedia.path,
                    webpPath: post.featuredMedia.webpPath,
                  }
                : null,
            }))}
          />
          <Suspense
            fallback={
              <div className="esth-blog-pagination" aria-hidden>
                <ShimmerSkeleton className="h-10 w-24 rounded-sm" />
                <ShimmerSkeleton className="h-10 w-40 rounded-sm" />
                <ShimmerSkeleton className="h-10 w-24 rounded-sm" />
              </div>
            }
          >
            <BlogPagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
          </Suspense>
        </EsthPageShell>
      </section>
    </main>
  );
}
