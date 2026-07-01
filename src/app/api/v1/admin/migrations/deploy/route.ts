import { getClientIp } from "@/lib/rate-limit";
import { jsonOk, requireAdminRole } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { logActivity } from "@/lib/services/activity.service";
import { deployPendingMigrations } from "@/lib/services/migration.service";

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdminRole("ADMIN");
    if (error) return error;

    const result = await deployPendingMigrations();

    await logActivity({
      actorId: session.user.id,
      action: result.success ? "MIGRATIONS_DEPLOYED" : "MIGRATIONS_DEPLOY_FAILED",
      entityType: "database",
      metadata: {
        message: result.message,
        pendingCount: result.status.pendingCount,
        appliedCount: result.status.appliedCount,
      },
      ip: getClientIp(request),
    });

    return jsonOk(result);
  } catch (e) {
    return toErrorResponse(e);
  }
}
