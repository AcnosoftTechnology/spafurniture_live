import { format } from "date-fns";
import { archiveKeyFromDate, blogArchiveLabel } from "@/lib/blog-archive";
import { blogCategoryPathSegments } from "@/lib/blog-paths";
import { prisma } from "@/lib/prisma";
import type { ContentStatus, Prisma } from "@prisma/client";

export type ListPostsParams = {
  status?: ContentStatus;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
  /** `YYYY-MM` — filter posts published in that calendar month */
  archive?: string;
  skip?: number;
  take?: number;
};

export type BlogArchiveMonth = {
  key: string;
  label: string;
  href: string;
};

function archiveDateRange(archive: string): { gte: Date; lte: Date } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(archive.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return {
    gte: new Date(year, month - 1, 1),
    lte: new Date(year, month, 0, 23, 59, 59, 999),
  };
}

function buildPostWhere(params?: ListPostsParams): Prisma.BlogPostWhereInput {
  const archiveRange = params?.archive ? archiveDateRange(params.archive) : null;
  return {
    ...(params?.status !== undefined ? { status: params.status } : {}),
    ...(archiveRange ? { publishedAt: archiveRange } : {}),
    OR: params?.search
      ? [
          { title: { contains: params.search, mode: "insensitive" } },
          { excerpt: { contains: params.search, mode: "insensitive" } },
        ]
      : undefined,
    categories: params?.categorySlug
      ? { some: { category: { slug: params.categorySlug } } }
      : undefined,
    tags: params?.tagSlug ? { some: { tag: { slug: params.tagSlug } } } : undefined,
  };
}

export async function listPosts(params?: ListPostsParams) {
  return prisma.blogPost.findMany({
    where: buildPostWhere(params),
    orderBy: { publishedAt: "desc" },
    skip: params?.skip ?? 0,
    take: params?.take ?? 20,
    include: {
      author: { select: { id: true, name: true } },
      featuredMedia: true,
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { id: true, name: true } },
      featuredMedia: true,
      categories: { include: { category: { include: { parent: { include: { parent: true } } } } } },
      tags: { include: { tag: true } },
    },
  });
}

export async function getApprovedBlogCommentsForPost(postId: string) {
  return prisma.blogComment.findMany({
    where: { postId, status: "APPROVED" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      authorName: true,
      content: true,
      createdAt: true,
      parentId: true,
    },
  });
}

export async function getPostById(id: string) {
  return prisma.blogPost.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      featuredMedia: true,
    },
  });
}

export async function createPost(data: Prisma.BlogPostCreateInput) {
  return prisma.blogPost.create({ data });
}

export async function updatePost(id: string, data: Prisma.BlogPostUpdateInput) {
  return prisma.blogPost.update({ where: { id }, data });
}

export async function listBlogCategories() {
  return prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: { include: { parent: true } },
    },
  });
}

export async function getBlogCategoryByPath(segments: string[]) {
  if (!segments.length) return null;
  const leafSlug = segments[segments.length - 1];
  const category = await prisma.blogCategory.findUnique({
    where: { slug: leafSlug },
    include: { parent: { include: { parent: true } } },
  });
  if (!category) return null;
  const built = blogCategoryPathSegments(category);
  if (built.join("/") !== segments.join("/")) return null;
  return category;
}

export async function listBlogTags() {
  return prisma.blogTag.findMany({ orderBy: { name: "asc" } });
}

export async function listBlogArchiveMonths(limit = 24): Promise<BlogArchiveMonth[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", publishedAt: { not: null } },
    select: { publishedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 500,
  });
  const seen = new Set<string>();
  const archives: BlogArchiveMonth[] = [];
  for (const post of posts) {
    if (!post.publishedAt) continue;
    const key = archiveKeyFromDate(post.publishedAt);
    if (seen.has(key)) continue;
    seen.add(key);
    const [y, m] = key.split("-").map(Number);
    archives.push({
      key,
      label: blogArchiveLabel(y, m),
      href: `/${y}/${String(m).padStart(2, "0")}/`,
    });
    if (archives.length >= limit) break;
  }
  return archives;
}

export async function listBlogTagsForSidebar(limit = 50) {
  return prisma.blogTag.findMany({
    where: { posts: { some: { post: { status: "PUBLISHED" } } } },
    orderBy: { name: "asc" },
    take: limit,
    select: { id: true, name: true, slug: true },
  });
}

export async function getBlogSidebarData(currentPostId: string) {
  const [recentPosts, categories, archives, tags] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED", id: { not: currentPostId } },
      orderBy: { publishedAt: "desc" },
      take: 8,
      select: { slug: true, title: true },
    }),
    listBlogCategories(),
    listBlogArchiveMonths(18),
    listBlogTagsForSidebar(),
  ]);
  return { recentPosts, categories, archives, tags };
}

export async function countBlogPosts(params?: ListPostsParams) {
  return prisma.blogPost.count({ where: buildPostWhere(params) });
}

export async function deletePost(id: string) {
  return prisma.blogPost.delete({ where: { id } });
}

export async function deletePosts(ids: string[]) {
  if (!ids.length) return { count: 0 };
  return prisma.blogPost.deleteMany({ where: { id: { in: ids } } });
}
