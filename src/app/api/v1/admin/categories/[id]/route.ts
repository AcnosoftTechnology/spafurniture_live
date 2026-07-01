import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { getCategoryById } from "@/lib/services/category.service";
import {
  deleteCategoryAdmin,
  saveCategoryAdmin,
} from "@/lib/services/category-admin.service";
import { logActivity } from "@/lib/services/activity.service";
import { toErrorResponse } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import { categoryPath } from "@/lib/paths";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) return jsonError("NOT_FOUND", "Not found", 404);
  return jsonOk(category);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    const { id } = await params;
    const body = await request.json();
    const category = await saveCategoryAdmin(id, body);
    if (category?.slug) revalidatePath(categoryPath(category.slug));
    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/products/");
    return jsonOk(category);
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, error } = await requireAdminSession();
    if (error || !session) return error;
    const { id } = await params;
    const deleted = await deleteCategoryAdmin(id);
    await logActivity({
      actorId: session.user.id,
      action: "category.deleted",
      entityType: "Category",
      entityId: id,
      metadata: { slug: deleted.slug },
    });
    revalidatePath(categoryPath(deleted.slug));
    revalidatePath("/products");
    revalidatePath("/admin/categories");
    return jsonOk({ deleted: true });
  } catch (e) {
    return toErrorResponse(e);
  }
}
