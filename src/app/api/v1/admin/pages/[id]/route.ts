import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import {
  deletePageAdmin,
  getPageById,
  savePageAdmin,
} from "@/lib/services/page-admin.service";
import { logActivity } from "@/lib/services/activity.service";
import { toErrorResponse } from "@/lib/errors";
import { revalidatePath } from "next/cache";

function pagePathForRevalidate(slug: string) {
  if (slug === "home") return "/";
  if (slug === "about") return "/about";
  return `/${slug}`;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  const page = await getPageById(id);
  if (!page) return jsonError("NOT_FOUND", "Not found", 404);
  return jsonOk(page);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    const { id } = await params;
    const body = await request.json();
    const page = await savePageAdmin(id, body);
    revalidatePath(pagePathForRevalidate(page.slug));
    revalidatePath("/admin/seo-pages");
    return jsonOk(page);
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, error } = await requireAdminSession();
    if (error || !session) return error;
    const { id } = await params;
    const deleted = await deletePageAdmin(id);
    await logActivity({
      actorId: session.user.id,
      action: "page.deleted",
      entityType: "Page",
      entityId: id,
      metadata: { slug: deleted.slug },
    });
    revalidatePath(pagePathForRevalidate(deleted.slug));
    revalidatePath("/admin/seo-pages");
    return jsonOk({ deleted: true });
  } catch (e) {
    return toErrorResponse(e);
  }
}
