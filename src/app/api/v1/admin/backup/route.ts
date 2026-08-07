import { requireAdminRole, jsonOk } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import {
  getBackupEstimates,
  isWebBackupEnabled,
  listBackupJobs,
} from "@/lib/services/backup.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error } = await requireAdminRole("ADMIN");
    if (error) return error;

    const [estimates, jobs] = await Promise.all([getBackupEstimates(), listBackupJobs()]);
    return jsonOk({
      ...estimates,
      webBackupEnabled: isWebBackupEnabled() && estimates.webBackupEnabled,
      jobs,
      retentionDays: Number(process.env.BACKUP_RETENTION_DAYS?.trim() || 30) || 30,
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}
