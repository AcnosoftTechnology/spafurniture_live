import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { countBlogPosts, listPosts } from "@/lib/services/blog.service";
import { saveBlogPostAdmin } from "@/lib/services/blog-admin.service";
import { toErrorResponse } from "@/lib/errors";
import { revalidateBlogArchivePaths } from "@/lib/blog-archive-revalidate";
import { blogPostPath } from "@/lib/blog-paths";
import { revalidatePath } from "next/cache";
import type { ContentStatus } from "@prisma/client";

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const search = searchParams.get("search") ?? undefined;
  const statusParam = searchParams.get("status");
  const status: ContentStatus | undefined =
    statusParam === "PUBLISHED" || statusParam === "DRAFT" || statusParam === "ARCHIVED"
      ? statusParam
      : undefined;

  const filters = { search, status };
  const [items, total] = await Promise.all([
    listPosts({
      ...filters,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    countBlogPosts(filters),
  ]);

  return jsonOk({
    items: items.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      publishedAt: p.publishedAt,
    })),
    total,
    page,
    pageSize,
  });
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    const body = await request.json();
    if (!body.authorId) return jsonError("VALIDATION_ERROR", "Author required", 400);
    const post = await saveBlogPostAdmin(null, body);
    revalidatePath("/blog");
    revalidateBlogArchivePaths(post?.publishedAt);
    if (post?.slug) revalidatePath(blogPostPath(post.slug));
    return jsonOk(post);
  } catch (e) {
    return toErrorResponse(e);
  }
}
