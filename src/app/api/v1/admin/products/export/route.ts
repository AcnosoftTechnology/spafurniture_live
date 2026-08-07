import { requireAdminSession, jsonError } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import {
  buildProductExportCsv,
  buildProductExportJson,
  fetchProductsForExport,
} from "@/lib/services/product-export.service";
import type { ContentStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAdminSession();
    if (error || !session) return error;

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") ?? "json").toLowerCase();
    if (format !== "json" && format !== "csv") {
      return jsonError("VALIDATION_ERROR", "format must be json or csv", 400);
    }

    const statusParam = searchParams.get("status");
    const status: ContentStatus | undefined =
      statusParam === "PUBLISHED" || statusParam === "DRAFT" || statusParam === "ARCHIVED"
        ? statusParam
        : undefined;

    const idsParam = searchParams.get("ids");
    const ids = idsParam
      ? idsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : undefined;

    const search = searchParams.get("search") ?? undefined;

    const products = await fetchProductsForExport({ status, ids, search });
    const stamp = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      const csv = buildProductExportCsv(products);
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="products-export-${stamp}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const payload = buildProductExportJson(products);
    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="products-export-${stamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}
