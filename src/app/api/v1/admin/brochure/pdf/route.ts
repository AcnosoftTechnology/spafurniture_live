import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { uploadMedia } from "@/lib/services/media.service";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdminSession();
    if (error || !session) return error;

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return jsonError(
        "INVALID_BODY",
        "Upload must be sent as multipart form data (select a PDF file).",
        400,
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not read upload";
      return jsonError("INVALID_BODY", message, 400);
    }

    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return jsonError("INVALID_FILE", "No PDF file received", 400);
    }

    const uploadFile = file as File;
    const isPdf =
      uploadFile.type === "application/pdf" || uploadFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return jsonError("INVALID_FILE", "Only PDF files are allowed", 400);
    }

    const media = await uploadMedia(uploadFile, session.user.id);
    return jsonOk(media);
  } catch (e) {
    return toErrorResponse(e);
  }
}
