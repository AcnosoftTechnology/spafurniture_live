import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { parseMultipartUpload } from "@/lib/parse-multipart-upload";
import { uploadMedia } from "@/lib/services/media.service";
import { logActivity } from "@/lib/services/activity.service";
import { toErrorResponse } from "@/lib/errors";
import { AppError } from "@/lib/errors";
import { MAX_MEDIA_UPLOAD_MB } from "@/lib/media-types";

export const runtime = "nodejs";

/** Admin file upload — outside /api/v1/admin middleware matcher so the body stream stays intact. */
export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdminSession();
    if (error || !session) return error;

    const { buffer, filename, mimeType } = await parseMultipartUpload(request);
    const file = new File([new Uint8Array(buffer)], filename, { type: mimeType });
    const media = await uploadMedia(file, session.user.id);

    void logActivity({
      actorId: session.user.id,
      action: "media.uploaded",
      entityType: "Media",
      entityId: media.id,
    }).catch((err) => console.error("Failed to log media upload activity", err));

    return jsonOk(media);
  } catch (e) {
    if (e instanceof AppError) {
      return jsonError(e.code, e.message, e.status);
    }
    if (e instanceof Error) {
      if (e.message.includes(`${MAX_MEDIA_UPLOAD_MB}MB`)) {
        return jsonError("FILE_TOO_LARGE", e.message, 400);
      }
      return jsonError("INVALID_BODY", e.message, 400);
    }
    return toErrorResponse(e);
  }
}
