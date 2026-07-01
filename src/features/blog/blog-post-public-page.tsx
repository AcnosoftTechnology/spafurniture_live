import { notFound } from "next/navigation";
import {
  getApprovedBlogCommentsForPost,
  getPostBySlug,
  getBlogSidebarData,
} from "@/lib/services/blog.service";
import {
  buildBlogHeroMetaLine,
  resolveBlogAuthorDisplayName,
} from "@/lib/blog-post-hero";
import { BlogPostDetail } from "@/components/site/blog/blog-post-detail";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { blogPostSchema, breadcrumbSchema, jsonLdGraph } from "@/lib/seo/schema";
import { getBaseUrl, mediaUrl } from "@/lib/utils";
import { getSiteConfig } from "@/lib/site-settings";
import { blogPostPath, blogIndexPath } from "@/lib/blog-paths";

export function normalizeBlogPostSlug(raw: string) {
  return decodeURIComponent(raw).replace(/\/+$/, "");
}

export async function buildBlogPostMetadata(slug: string) {
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) return {};
  return buildPageMetadata(
    {
      title: post.title,
      seoTitle: post.seoTitle,
      metaDescription: post.metaDescription ?? post.excerpt,
      ogImage: post.featuredMedia ? mediaUrl(post.featuredMedia.path) : undefined,
    },
    blogPostPath(slug),
  );
}

export async function BlogPostPublicPage({ slug: rawSlug }: { slug: string }) {
  const slug = normalizeBlogPostSlug(rawSlug);
  const [post, site] = await Promise.all([getPostBySlug(slug), getSiteConfig().catch(() => null)]);
  if (!post) notFound();

  const comments = await getApprovedBlogCommentsForPost(post.id).catch(() => []);

  const sidebar = await getBlogSidebarData(post.id).catch(() => ({
    recentPosts: [],
    categories: [],
    archives: [],
    tags: [],
  }));

  const baseUrl = getBaseUrl();
  const authorLabel = resolveBlogAuthorDisplayName(post.authorDisplayName, post.author?.name);
  const heroMetaLine = buildBlogHeroMetaLine(post.publishedAt, authorLabel);
  const featuredSrc = post.featuredMedia?.path ? mediaUrl(post.featuredMedia.path) : null;
  const social = site?.social?.length ? site.social : [];
  const postUrl = `${baseUrl}${blogPostPath(post.slug)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdGraph(
          blogPostSchema({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            publishedAt: post.publishedAt,
            authorName: authorLabel,
            image: featuredSrc ? `${baseUrl}${featuredSrc}` : undefined,
          }),
          breadcrumbSchema([
            { name: "Home", url: `${baseUrl}/` },
            { name: "Blog", url: `${baseUrl}${blogIndexPath()}` },
            { name: post.title, url: postUrl },
          ]),
        )}
      />
      <BlogPostDetail
        post={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          content: post.content,
          authorLabel,
          heroMetaLine,
          featuredSrc,
          categories: post.categories,
        }}
        sidebar={sidebar}
        social={social}
        showComments
        comments={comments.map((comment) => ({
          id: comment.id,
          authorName: comment.authorName,
          content: comment.content,
          createdAt: comment.createdAt,
          parentId: comment.parentId,
        }))}
      />
    </>
  );
}
