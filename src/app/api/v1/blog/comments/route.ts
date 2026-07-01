import { blogCommentSchema } from "@/lib/validators/blog-comment";
import {
  assertPublishedPost,
  createBlogComment,
  getApprovedParentComment,
} from "@/lib/services/blog-comment.service";
import { lookupIpGeo } from "@/lib/ip-geo";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { jsonOk, jsonError } from "@/lib/api-response";
import { AppError, toErrorResponse } from "@/lib/errors";
import { prismaSchemaErrorMessage } from "@/lib/prisma-errors";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`blog-comment:${ip}`);
    if (!limit.success) {
      return jsonError("RATE_LIMITED", "Too many requests. Please try again later.", 429);
    }

    const body = await request.json();
    const parsed = blogCommentSchema.safeParse(body);
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Invalid comment submission.";
      return jsonError("VALIDATION_ERROR", message, 400);
    }

    if (parsed.data.website) {
      return jsonOk({ id: "ok" });
    }

    const post = await assertPublishedPost(parsed.data.postId);
    if (!post) {
      return jsonError("NOT_FOUND", "Post not found.", 404);
    }

    if (parsed.data.parentId) {
      const parent = await getApprovedParentComment(parsed.data.parentId, parsed.data.postId);
      if (!parent) {
        return jsonError("NOT_FOUND", "Parent comment not found.", 400);
      }
    }

    const geo = await lookupIpGeo(ip);

    const comment = await createBlogComment({
      postId: parsed.data.postId,
      parentId: parsed.data.parentId ?? null,
      authorName: parsed.data.authorName,
      email: parsed.data.email,
      content: parsed.data.content,
      ip,
      userAgent: request.headers.get("user-agent") ?? undefined,
      pageUrl: parsed.data.pageUrl || undefined,
      geoCountry: geo?.country,
      geoRegion: geo?.region,
      geoCity: geo?.city,
    });
    return jsonOk(
      { id: comment.id },
      { message: "Comment submitted and awaiting moderation." },
    );
  } catch (error) {
    const schemaMessage = prismaSchemaErrorMessage(error);
    if (schemaMessage) {
      return toErrorResponse(new AppError("DB_SCHEMA_OUTDATED", schemaMessage, 503));
    }
    return toErrorResponse(error);
  }
}
