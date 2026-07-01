import { z } from "zod";
import { sanitizeCommentContent, sanitizePersonName } from "@/lib/sanitize-user-input";

export const blogCommentSchema = z
  .object({
    postId: z.string().min(1),
    parentId: z.string().min(1).optional().nullable(),
    authorName: z.string().min(2).max(100),
    email: z.string().email(),
    content: z.string().min(3).max(5000),
    pageUrl: z.string().url().optional().or(z.literal("")),
    website: z.string().max(0).optional(),
  })
  .superRefine((data, ctx) => {
    const author = sanitizePersonName(data.authorName);
    if (!author.ok) {
      ctx.addIssue({ code: "custom", message: author.message, path: ["authorName"] });
    }

    const content = sanitizeCommentContent(data.content);
    if (!content.ok) {
      ctx.addIssue({ code: "custom", message: content.message, path: ["content"] });
    }
  })
  .transform((data) => {
    const author = sanitizePersonName(data.authorName);
    const content = sanitizeCommentContent(data.content);
    return {
      ...data,
      authorName: author.ok ? author.value : data.authorName.trim(),
      content: content.ok ? content.value : data.content.trim(),
    };
  });

export type BlogCommentInput = z.infer<typeof blogCommentSchema>;
