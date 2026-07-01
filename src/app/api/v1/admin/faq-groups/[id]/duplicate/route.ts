import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { duplicateFaqGroup, faqGroupShortcode } from "@/lib/services/faq-group.service";
import { toErrorResponse } from "@/lib/errors";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    const { id } = await params;
    const group = await duplicateFaqGroup(id);
    if (!group) return toErrorResponse(new Error("Duplicate failed"));

    return jsonOk({
      ...group,
      shortcode: faqGroupShortcode(group),
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}
