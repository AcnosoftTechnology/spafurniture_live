import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { deleteCategoriesAdmin } from "@/lib/services/category-admin.service";
import { logActivity } from "@/lib/services/activity.service";
import { toErrorResponse } from "@/lib/errors";
import { categoryPath } from "@/lib/paths";

const schema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdminSession();
    if (error || !session) return error;

    const body = schema.safeParse(await request.json());
    if (!body.success) return jsonError("VALIDATION_ERROR", body.error.message, 400);

    const result = await deleteCategoriesAdmin(body.data.ids);

    await logActivity({
      actorId: session.user.id,
      action: "category.bulk_deleted",
      entityType: "Category",
      metadata: { count: result.count, slugs: result.slugs },
    });

    for (const slug of result.slugs) {
      revalidatePath(categoryPath(slug));
    }
    revalidatePath("/products");
    revalidatePath("/admin/categories");

    return jsonOk({ deleted: result.count });
  } catch (e) {
    return toErrorResponse(e);
  }
}
