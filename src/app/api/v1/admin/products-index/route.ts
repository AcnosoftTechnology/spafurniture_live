import { revalidatePath } from "next/cache";
import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import {
  getAdminProductsIndexEditorData,
  saveProductsIndexLayout,
} from "@/features/products-index/get-products-index-data";
import { productsIndexLayoutSchema } from "@/features/products-index/schemas/products-index-layout.schema";

export async function GET() {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    return jsonOk(await getAdminProductsIndexEditorData());
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    const body = await request.json();
    const layout = productsIndexLayoutSchema.parse(body.layout);
    const saved = await saveProductsIndexLayout(layout);

    revalidatePath("/products/");

    return jsonOk({ layout: saved });
  } catch (e) {
    return toErrorResponse(e);
  }
}
