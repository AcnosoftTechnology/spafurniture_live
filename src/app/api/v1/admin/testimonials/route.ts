import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { testGooglePlaceReviewsConnection } from "@/features/testimonials/fetch-google-reviews";
import {
  getAdminTestimonialsEditorData,
  getTestimonialsContent,
  mergeTestimonialsPatch,
  saveTestimonialsContent,
} from "@/features/testimonials/get-testimonials-data";
import { testimonialsContentSchema } from "@/features/testimonials/schemas/testimonials-content.schema";

export async function GET() {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    return jsonOk(await getAdminTestimonialsEditorData());
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    const body = await request.json();
    const { content } = body as { content?: unknown };

    if (content) {
      const current = await getTestimonialsContent();
      const merged = mergeTestimonialsPatch(current, testimonialsContentSchema.parse(content));
      await saveTestimonialsContent(merged);
    }

    revalidateTag("testimonials-google", "max");
    revalidatePath("/");
    return jsonOk({ saved: true });
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    const body = (await request.json()) as {
      action?: string;
      placeId?: string;
      apiKey?: string;
    };

    if (body.action !== "test-google") {
      return toErrorResponse(new Error("Unsupported action"));
    }

    const current = await getTestimonialsContent();
    const placeId = body.placeId?.trim() || current.google.placeId;
    const apiKey = body.apiKey?.trim() || current.google.apiKey;

    const result = await testGooglePlaceReviewsConnection(placeId, apiKey);
    return jsonOk(result);
  } catch (e) {
    return toErrorResponse(e);
  }
}
