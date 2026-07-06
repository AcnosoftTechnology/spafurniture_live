import { revalidatePath } from "next/cache";
import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import {
  deleteRegionalPage,
  getAdminRegionalPageEditorData,
  saveRegionalPage,
} from "@/features/regional-pages/regional-page.service";
import type { RegionalPageContent } from "@/features/regional-pages/schemas/regional-content.schema";
import type { RegionalPageSeoFields } from "@/features/regional-pages/regional-page.service";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    const { slug } = await context.params;
    const data = await getAdminRegionalPageEditorData(slug);
    if (!data) return toErrorResponse(new Error("Regional page not found"));
    return jsonOk(data);
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    const { slug } = await context.params;
    const body = await request.json();
    const { content, page } = body as {
      content?: RegionalPageContent;
      page?: Partial<RegionalPageSeoFields>;
    };

    const saved = await saveRegionalPage(slug, { content, page });
    revalidatePath(`/${slug}`);
    revalidatePath(`/${slug}/`);
    revalidatePath("/admin/regional-pages");
    return jsonOk(saved);
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    const { slug } = await context.params;
    await deleteRegionalPage(slug);
    revalidatePath(`/${slug}`);
    revalidatePath(`/${slug}/`);
    revalidatePath("/admin/regional-pages");
    return jsonOk({ deleted: true });
  } catch (e) {
    return toErrorResponse(e);
  }
}
