import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { listFaqGroups, nextFaqGroupShortcodeId, saveFaqGroup } from "@/lib/services/faq-group.service";
import { toErrorResponse } from "@/lib/errors";
import { faqGroupShortcode } from "@/lib/services/faq-group.service";

export async function GET() {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    const groups = await listFaqGroups();
    return jsonOk(
      groups.map((g) => ({
        id: g.id,
        name: g.name,
        shortcodeId: g.shortcodeId,
        shortcode: faqGroupShortcode(g),
        itemCount: g._count.items,
        updatedAt: g.updatedAt,
      })),
    );
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    const body = await request.json();
    if (!body.name?.trim()) {
      return jsonError("VALIDATION_ERROR", "Group name is required", 400);
    }

    const shortcodeId = body.shortcodeId ?? (await nextFaqGroupShortcodeId());
    const group = await saveFaqGroup(null, {
      name: body.name.trim(),
      shortcodeId: Number(shortcodeId),
      items: Array.isArray(body.items) ? body.items : [],
    });

    return jsonOk(group);
  } catch (e) {
    return toErrorResponse(e);
  }
}
