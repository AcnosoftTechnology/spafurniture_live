import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { listPagesAdmin, savePageAdmin } from "@/lib/services/page-admin.service";
import { toErrorResponse } from "@/lib/errors";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  return jsonOk(await listPagesAdmin({ search, page, pageSize }));
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    const body = await request.json();
    const page = await savePageAdmin(null, body);
    revalidatePath(pagePathForRevalidate(page.slug));
    revalidatePath("/admin/seo-pages");
    return jsonOk(page);
  } catch (e) {
    return toErrorResponse(e);
  }
}

function pagePathForRevalidate(slug: string) {
  if (slug === "home") return "/";
  if (slug === "about") return "/about";
  return `/${slug}`;
}
