import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { listCategories } from "@/lib/services/category.service";
import { saveCategoryAdmin } from "@/lib/services/category-admin.service";
import { toErrorResponse } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import { categoryPath } from "@/lib/paths";

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;
  return jsonOk(await listCategories());
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    const body = await request.json();
    const category = await saveCategoryAdmin(null, body);
    if (category?.slug) revalidatePath(categoryPath(category.slug));
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return jsonOk(category);
  } catch (e) {
    return toErrorResponse(e);
  }
}
