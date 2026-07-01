import { revalidatePath } from "next/cache";
import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { saveSiteSchemaSettings } from "@/features/settings/get-site-schema";
import { siteSchemaSettingsSchema } from "@/features/settings/schemas/site-schema.schema";

export async function PATCH(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    const body = await request.json();
    const saved = await saveSiteSchemaSettings(siteSchemaSettingsSchema.parse(body));

    revalidatePath("/", "layout");

    return jsonOk(saved);
  } catch (e) {
    return toErrorResponse(e);
  }
}
