import { z } from "zod";
import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { getBlogCommentById, updateBlogCommentStatus } from "@/lib/services/blog-comment.service";

const patchSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SPAM"]),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const comment = await getBlogCommentById(id);
  if (!comment) {
    return jsonError("NOT_FOUND", "Comment not found.", 404);
  }

  return jsonOk(comment);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const body = patchSchema.parse(await request.json());
  const comment = await updateBlogCommentStatus(id, body.status, session!.user!.id);
  return jsonOk(comment);
}
