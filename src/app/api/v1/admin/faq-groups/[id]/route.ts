import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { deleteFaqGroup, getFaqGroupById, saveFaqGroup } from "@/lib/services/faq-group.service";
import { toErrorResponse } from "@/lib/errors";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  const group = await getFaqGroupById(id);
  if (!group) return jsonError("NOT_FOUND", "FAQ group not found", 404);
  return jsonOk(group);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    const { id } = await params;
    const body = await request.json();

    if (!body.name?.trim()) {
      return jsonError("VALIDATION_ERROR", "Group name is required", 400);
    }

    const group = await saveFaqGroup(id, {
      name: body.name.trim(),
      shortcodeId: body.shortcodeId,
      items: Array.isArray(body.items) ? body.items : [],
    });

    return jsonOk(group);
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  await deleteFaqGroup(id);
  return jsonOk({ deleted: true });
}
