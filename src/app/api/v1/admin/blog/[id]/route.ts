import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { deletePost } from "@/lib/services/blog.service";
import { saveBlogPostAdmin } from "@/lib/services/blog-admin.service";
import { logActivity } from "@/lib/services/activity.service";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/errors";
import { revalidateBlogArchivePaths } from "@/lib/blog-archive-revalidate";
import { blogPostPath } from "@/lib/blog-paths";
import { revalidatePath } from "next/cache";

function revalidateBlogPostPath(slug: string | null | undefined) {
  if (!slug) return;
  revalidatePath(blogPostPath(slug));
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      featuredMedia: true,
      ogImage: true,
      categories: true,
      tags: true,
    },
  });
  if (!post) return jsonError("NOT_FOUND", "Not found", 404);
  return jsonOk(post);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdminSession();
  if (error || !session) return error;
  const { id } = await params;

  const existing = await prisma.blogPost.findUnique({
    where: { id },
    select: { slug: true, publishedAt: true },
  });
  if (!existing) return jsonError("NOT_FOUND", "Post not found", 404);

  await deletePost(id);
  await logActivity({
    actorId: session.user.id,
    action: "blog.deleted",
    entityType: "BlogPost",
    entityId: id,
  });

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidateBlogArchivePaths(existing.publishedAt);
  revalidateBlogPostPath(existing.slug);

  return jsonOk({ deleted: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    const { id } = await params;
    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { publishedAt: true, slug: true },
    });
    const body = await request.json();
    const post = await saveBlogPostAdmin(id, body);
    revalidatePath("/blog");
    revalidateBlogArchivePaths(existing?.publishedAt, post?.publishedAt);
    revalidateBlogPostPath(post?.slug);
    if (existing?.slug && existing.slug !== post?.slug) revalidateBlogPostPath(existing.slug);
    return jsonOk(post);
  } catch (e) {
    return toErrorResponse(e);
  }
}
