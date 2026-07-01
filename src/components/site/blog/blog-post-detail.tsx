import Image from "next/image";
import Link from "next/link";
import { RichContentRenderer } from "@/components/site/rich-content-renderer";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import { BlogPostSidebar } from "@/components/site/blog/blog-post-sidebar";
import {
  BlogCommentsSection,
  type BlogCommentItem,
} from "@/components/site/blog/blog-comments-section";
import { mediaUrl } from "@/lib/utils";
import { blogIndexPath, blogCategoryPath } from "@/lib/blog-paths";
import type { BlogCategoryPathInput } from "@/lib/blog-paths";
import type { BlogArchiveMonth } from "@/lib/services/blog.service";

export type BlogPostDetailProps = {
  post: {
    id: string;
    slug: string;
    title: string;
    content: unknown;
    authorLabel: string;
    heroMetaLine: string;
    featuredSrc: string | null;
    categories: Array<{
      categoryId: string;
      category: (BlogCategoryPathInput & { name: string }) | null;
    }>;
  };
  sidebar: {
    recentPosts: { slug: string; title: string }[];
    categories: { id: string; name: string; slug: string }[];
    archives: BlogArchiveMonth[];
    tags: { id: string; name: string; slug: string }[];
  };
  social: { platform: string; href: string }[];
  showComments: boolean;
  comments: BlogCommentItem[];
};

export function BlogPostDetail({ post, sidebar, social, showComments, comments }: BlogPostDetailProps) {
  return (
    <main className="esth-blog-page-main esth-blog-post-page">
      <section className="esth-blog-post-hero">
        <EsthPageShell>
          <Link href={blogIndexPath()} className="esth-blog-post-back">
            ← Back to blog
          </Link>
          <div className="esth-blog-post-hero-inner">
            <h1 className="esth-blog-post-hero-title">{post.title}</h1>
            {post.heroMetaLine ? <p className="esth-blog-post-hero-meta">{post.heroMetaLine}</p> : null}
          </div>
        </EsthPageShell>
      </section>

      <section className="esth-blog-post-layout">
        <EsthPageShell className="esth-blog-post-grid">
          <article className="esth-blog-post-main">
            {post.featuredSrc ? (
              <div className="esth-blog-post-featured">
                <Image
                  src={post.featuredSrc}
                  alt={post.title}
                  width={900}
                  height={506}
                  className="esth-blog-post-featured-img"
                  priority
                  sizes="(max-width: 900px) 100vw, 900px"
                />
              </div>
            ) : null}

            {post.categories.length > 0 ? (
              <div className="esth-blog-post-tags">
                {post.categories.map((c) =>
                  c.category?.slug ? (
                    <Link key={c.categoryId} href={blogCategoryPath(c.category)}>
                      {c.category.name}
                    </Link>
                  ) : null,
                )}
              </div>
            ) : null}

            <RichContentRenderer content={post.content} className="esth-blog-article" />

            {showComments ? (
              <BlogCommentsSection postId={post.id} postTitle={post.title} comments={comments} />
            ) : null}
          </article>

          <BlogPostSidebar
            recentPosts={sidebar.recentPosts}
            categories={sidebar.categories}
            archives={sidebar.archives}
            tags={sidebar.tags}
            social={social}
          />
        </EsthPageShell>
      </section>
    </main>
  );
}
