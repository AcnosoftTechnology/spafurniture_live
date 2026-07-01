import { Suspense } from "react";
import { redirect } from "next/navigation";
import { listPosts, countBlogPosts } from "@/lib/services/blog.service";
import { blogArchiveLabel, blogArchivePath } from "@/lib/blog-archive";
import { BLOG_PAGE_SIZE } from "@/lib/blog-constants";
import { BlogCard, type BlogCardPost } from "@/components/site/blog/blog-card";
import { BlogPagination } from "@/components/site/blog/blog-pagination";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import { ShimmerSkeleton } from "@/components/ui/skeleton";

function toCardPost(
  post: Awaited<ReturnType<typeof listPosts>>[number],
): BlogCardPost {
  return {
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
  };
}

type BlogArchivePageProps = {
  year: number;
  month: number;
  archiveKey: string;
  searchParams: Promise<{ page?: string }>;
};

export async function BlogArchivePage({ year, month, archiveKey, searchParams }: BlogArchivePageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const skip = (currentPage - 1) * BLOG_PAGE_SIZE;
  const basePath = blogArchivePath(year, month);
  const monthTitle = `Month: ${blogArchiveLabel(year, month)}`;

  let posts: Awaited<ReturnType<typeof listPosts>> = [];
  let total = 0;

  try {
    [posts, total] = await Promise.all([
      listPosts({ status: "PUBLISHED", archive: archiveKey, skip, take: BLOG_PAGE_SIZE }),
      countBlogPosts({ status: "PUBLISHED", archive: archiveKey }),
    ]);
  } catch {
    // empty
  }

  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));

  if (total > 0 && currentPage > totalPages) {
    const qs = totalPages > 1 ? `?page=${totalPages}` : "";
    redirect(`${basePath}${qs}`);
  }

  return (
    <main className="esth-blog-page-main esth-blog-archive-page">
      <EsthPageShell className="esth-blog-archive-shell">
        <header className="esth-blog-archive-header">
          <h1 className="esth-blog-archive-title">{monthTitle}</h1>
        </header>

        {posts.length === 0 ? (
          <p className="esth-blog-archive-empty">No articles were published in this month.</p>
        ) : (
          <div className="esth-blog-posts esth-blog-posts--list esth-blog-posts--archive">
            {posts.map((post) => (
              <BlogCard key={post.id} post={toCardPost(post)} view="list" />
            ))}
          </div>
        )}

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
    </main>
  );
}
