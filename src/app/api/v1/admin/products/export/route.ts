import { requireAdminSession, jsonError } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { PRODUCT_EXPORT_FIELD_KEYS } from "@/lib/product-export-fields";
import {
  buildProductExportCsv,
  buildProductExportJson,
  fetchProductsForExport,
} from "@/lib/services/product-export.service";
import type { ContentStatus } from "@prisma/client";

function parseFields(raw: string | null): string[] | undefined {
  if (!raw?.trim()) return undefined;
  const keys = raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  if (!keys.length) return undefined;
  const allowed = new Set(PRODUCT_EXPORT_FIELD_KEYS);
  const valid = keys.filter((k) => allowed.has(k));
  return valid.length ? valid : undefined;
}

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
    const fields = parseFields(searchParams.get("fields"));

    if (searchParams.has("fields") && !fields?.length) {
      return jsonError("VALIDATION_ERROR", "Select at least one valid export field.", 400);
    }

    const products = await fetchProductsForExport({ status, ids, search });
    const stamp = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      const csv = buildProductExportCsv(products, fields);
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="products-export-${stamp}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const payload = buildProductExportJson(products, fields);
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
