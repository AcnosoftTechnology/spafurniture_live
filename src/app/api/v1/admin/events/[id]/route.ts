import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { getEventById } from "@/lib/services/event.service";
import { deleteEventAdmin, saveEventAdmin } from "@/lib/services/event-admin.service";
import { toErrorResponse } from "@/lib/errors";
import { revalidatePath } from "next/cache";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return jsonError("NOT_FOUND", "Not found", 404);
  return jsonOk(event);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    const { id } = await params;
    const body = await request.json();
    const event = await saveEventAdmin(id, body);
    revalidatePath("/shows-and-exhibitions/");
    return jsonOk(event);
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    const { id } = await params;
    await deleteEventAdmin(id);
    revalidatePath("/shows-and-exhibitions/");
    return jsonOk({ deleted: true });
  } catch (e) {
    return toErrorResponse(e);
  }
}
