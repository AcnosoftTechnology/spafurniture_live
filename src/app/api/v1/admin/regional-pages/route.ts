import { revalidatePath } from "next/cache";
import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import {
  createRegionalPage,
  listRegionalPages,
} from "@/features/regional-pages/regional-page.service";

export async function GET() {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    return jsonOk(await listRegionalPages());
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    const body = await request.json();
    const slug = String(body.slug ?? "");
    const title = String(body.title ?? "");
    const created = await createRegionalPage({ slug, title });

    revalidatePath(`/${created.slug}`);
    revalidatePath(`/${created.slug}/`);
    revalidatePath("/admin/regional-pages");
    return jsonOk(created);
  } catch (e) {
    return toErrorResponse(e);
  }
}
