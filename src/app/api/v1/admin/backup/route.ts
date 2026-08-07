import { requireAdminRole, jsonOk, jsonError } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { getBackupEstimates, isWebBackupEnabled } from "@/lib/services/backup.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error } = await requireAdminRole("ADMIN");
    if (error) return error;

    const estimates = await getBackupEstimates();
    return jsonOk({
      ...estimates,
      webBackupEnabled: isWebBackupEnabled() && estimates.webBackupEnabled,
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}
