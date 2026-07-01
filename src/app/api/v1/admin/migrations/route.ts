import { jsonOk, requireAdminRole } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { getMigrationStatus } from "@/lib/services/migration.service";

export async function GET() {
  try {
    const { error } = await requireAdminRole("ADMIN");
    if (error) return error;
    return jsonOk(await getMigrationStatus());
  } catch (e) {
    return toErrorResponse(e);
  }
}
