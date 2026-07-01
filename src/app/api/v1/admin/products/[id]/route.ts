import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { getProductById, deleteProduct } from "@/lib/services/product.service";
import { saveProductAdmin } from "@/lib/services/product-admin.service";
import { logActivity } from "@/lib/services/activity.service";
import { toErrorResponse } from "@/lib/errors";
import { revalidatePath } from "next/cache";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return jsonError("NOT_FOUND", "Product not found", 404);
  return jsonOk(product);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, error } = await requireAdminSession();
    if (error || !session) return error;
    const { id } = await params;
    const body = await request.json();
    const product = await saveProductAdmin(id, body);
    await logActivity({ actorId: session.user.id, action: "product.updated", entityType: "Product", entityId: id });
    revalidatePath("/products");
    if (product?.slug) {
      const { productPath } = await import("@/lib/paths");
      revalidatePath(productPath(product.slug));
    }
    return jsonOk(product);
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdminSession();
  if (error || !session) return error;
  const { id } = await params;
  await deleteProduct(id);
  await logActivity({ actorId: session.user.id, action: "product.deleted", entityType: "Product", entityId: id });
  revalidatePath("/products");
  return jsonOk({ deleted: true });
}
