import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { countProducts, listProducts } from "@/lib/services/product.service";
import { saveProductAdmin } from "@/lib/services/product-admin.service";
import { logActivity } from "@/lib/services/activity.service";
import { toErrorResponse } from "@/lib/errors";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { ContentStatus } from "@prisma/client";

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
}).passthrough();

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const search = searchParams.get("search") ?? undefined;
  const statusParam = searchParams.get("status");
  const status: ContentStatus | undefined =
    statusParam === "PUBLISHED" || statusParam === "DRAFT" || statusParam === "ARCHIVED"
      ? statusParam
      : undefined;

  const filters = { search, status };
  const [items, total] = await Promise.all([
    listProducts({
      ...filters,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    countProducts(filters),
  ]);

  return jsonOk({
    items: items.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
    })),
    total,
    page,
    pageSize,
  });
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdminSession();
    if (error || !session) return error;
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError("VALIDATION_ERROR", parsed.error.message, 400);

    const product = await saveProductAdmin(null, body);
    await logActivity({
      actorId: session.user.id,
      action: "product.created",
      entityType: "Product",
      entityId: product?.id,
    });
    revalidatePath("/products");
    return jsonOk(product);
  } catch (e) {
    return toErrorResponse(e);
  }
}
