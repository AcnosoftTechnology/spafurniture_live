import { requireAdminRole, jsonOk, jsonError } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { deleteBackupJob } from "@/lib/services/backup.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdminRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const deleted = await deleteBackupJob(id);
    if (!deleted) return jsonError("NOT_FOUND", "Backup not found.", 404);
    return jsonOk({ deleted: true });
  } catch (e) {
    return toErrorResponse(e);
  }
}
