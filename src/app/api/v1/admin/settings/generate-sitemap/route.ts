import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { generateSitemaps } from "@/features/seo/sitemap/generate-sitemaps";

export async function POST() {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    const result = await generateSitemaps();
    return jsonOk(result);
  } catch (e) {
    return toErrorResponse(e);
  }
}
