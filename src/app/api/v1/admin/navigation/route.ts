import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { getNavigationEditorItems, saveNavigationItems, type NavEditorItem } from "@/features/settings/get-settings-data";

const navItemSchema: z.ZodType<NavEditorItem> = z.lazy(() =>
  z.object({
    clientId: z.string(),
    label: z.string().min(1),
    url: z.string(),
    children: z.array(navItemSchema).default([]),
  }),
);

const navigationPayloadSchema = z.object({
  items: z.array(navItemSchema),
});

export async function GET() {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    return jsonOk(await getNavigationEditorItems());
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    const body = await request.json();
    const { items } = navigationPayloadSchema.parse(body);
    const saved = await saveNavigationItems(items);

    revalidatePath("/", "layout");

    return jsonOk(saved);
  } catch (e) {
    return toErrorResponse(e);
  }
}
