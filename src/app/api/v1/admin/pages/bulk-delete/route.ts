import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { deletePagesAdmin } from "@/lib/services/page-admin.service";
import { logActivity } from "@/lib/services/activity.service";
import { toErrorResponse } from "@/lib/errors";

const schema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdminSession();
    if (error || !session) return error;

    const body = schema.safeParse(await request.json());
    if (!body.success) return jsonError("VALIDATION_ERROR", body.error.message, 400);

    const result = await deletePagesAdmin(body.data.ids);

    await logActivity({
      actorId: session.user.id,
      action: "page.bulk_deleted",
      entityType: "Page",
      metadata: { count: result.count, slugs: result.slugs },
    });

    for (const slug of result.slugs) {
      revalidatePath(slug === "about" ? "/about" : `/${slug}`);
    }
    revalidatePath("/admin/seo-pages");

    return jsonOk({ deleted: result.count });
  } catch (e) {
    return toErrorResponse(e);
  }
}
