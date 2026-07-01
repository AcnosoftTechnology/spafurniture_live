import { revalidatePath } from "next/cache";
import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import {
  getAdminSettingsEditorData,
  getSiteConfig,
  mergeSiteConfigPatch,
  saveSiteConfig,
  sanitizeSiteConfigForAdmin,
} from "@/features/settings/get-settings-data";

export async function GET() {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    return jsonOk(await getAdminSettingsEditorData());
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    const body = await request.json();
    const current = await getSiteConfig();
    const merged = mergeSiteConfigPatch(current, body);
    const saved = await saveSiteConfig(merged);

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/api/site-favicon");
    revalidatePath("/favicon.ico");

    return jsonOk(sanitizeSiteConfigForAdmin(saved));
  } catch (e) {
    return toErrorResponse(e);
  }
}
