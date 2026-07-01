import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { listBlogComments } from "@/lib/services/blog-comment.service";
import type { CommentStatus } from "@prisma/client";

const STATUSES = ["PENDING", "APPROVED", "REJECTED", "SPAM"] as const;

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const statusParam = new URL(request.url).searchParams.get("status");
  const status =
    statusParam && STATUSES.includes(statusParam as (typeof STATUSES)[number])
      ? (statusParam as CommentStatus)
      : undefined;

  try {
    const comments = await listBlogComments({ status });
    return jsonOk(comments);
  } catch (error) {
    return toErrorResponse(error);
  }
}
