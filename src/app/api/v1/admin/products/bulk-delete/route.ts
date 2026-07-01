import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { deleteProducts } from "@/lib/services/product.service";
import { logActivity } from "@/lib/services/activity.service";

const schema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export async function POST(request: Request) {
  const { session, error } = await requireAdminSession();
  if (error || !session) return error;

  const body = schema.safeParse(await request.json());
  if (!body.success) return jsonError("VALIDATION_ERROR", body.error.message, 400);

  const result = await deleteProducts(body.data.ids);

  await logActivity({
    actorId: session.user.id,
    action: "product.bulk_deleted",
    entityType: "Product",
    metadata: { count: result.count, ids: body.data.ids },
  });

  revalidatePath("/products");
  revalidatePath("/admin/products");

  return jsonOk({ deleted: result.count });
}
