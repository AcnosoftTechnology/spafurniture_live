import { prisma } from "@/lib/prisma";
import type { CommentStatus } from "@prisma/client";

export async function createBlogComment(data: {
  postId: string;
  parentId?: string | null;
  authorName: string;
  email: string;
  content: string;
  ip?: string;
  userAgent?: string;
  pageUrl?: string;
  geoCountry?: string;
  geoRegion?: string;
  geoCity?: string;
}) {
  return prisma.blogComment.create({
    data: {
      postId: data.postId,
      parentId: data.parentId ?? null,
      authorName: data.authorName.trim(),
      email: data.email.trim().toLowerCase(),
      content: data.content.trim(),
      status: "PENDING",
      ip: data.ip,
      userAgent: data.userAgent,
      pageUrl: data.pageUrl,
      geoCountry: data.geoCountry,
      geoRegion: data.geoRegion,
      geoCity: data.geoCity,
    },
  });
}

export async function getApprovedParentComment(parentId: string, postId: string) {
  return prisma.blogComment.findFirst({
    where: {
      id: parentId,
      postId,
      status: "APPROVED",
    },
    select: { id: true },
  });
}

export async function listBlogComments(params?: {
  status?: CommentStatus;
  postId?: string;
  take?: number;
}) {
  return prisma.blogComment.findMany({
    where: {
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.postId ? { postId: params.postId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: params?.take ?? 100,
    include: {
      post: { select: { id: true, title: true, slug: true } },
      parent: { select: { id: true, authorName: true, content: true } },
      moderatedBy: { select: { id: true, name: true } },
    },
  });
}

export async function getBlogCommentById(id: string) {
  return prisma.blogComment.findUnique({
    where: { id },
    include: {
      post: { select: { id: true, title: true, slug: true } },
      parent: { select: { id: true, authorName: true, content: true, createdAt: true } },
      moderatedBy: { select: { id: true, name: true } },
    },
  });
}

export async function updateBlogCommentStatus(
  id: string,
  status: CommentStatus,
  moderatedById?: string,
) {
  return prisma.blogComment.update({
    where: { id },
    data: {
      status,
      ...(moderatedById ? { moderatedById } : {}),
    },
    include: {
      post: { select: { id: true, title: true, slug: true } },
    },
  });
}

export async function countPendingBlogComments() {
  return prisma.blogComment.count({ where: { status: "PENDING" } });
}

export async function assertPublishedPost(postId: string) {
  return prisma.blogPost.findFirst({
    where: { id: postId, status: "PUBLISHED" },
    select: { id: true },
  });
}
