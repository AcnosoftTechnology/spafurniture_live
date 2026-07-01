import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { parseMultipartUpload } from "@/lib/parse-multipart-upload";
import { listMedia, uploadMedia } from "@/lib/services/media.service";
import { logActivity } from "@/lib/services/activity.service";
import { toErrorResponse, AppError } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const media = await listMedia({
    folderId: searchParams.get("folderId") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });
  return jsonOk(media);
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdminSession();
    if (error || !session) return error;
    const { buffer, filename, mimeType } = await parseMultipartUpload(request);
    const uploadFile = new File([new Uint8Array(buffer)], filename, { type: mimeType });
    const media = await uploadMedia(uploadFile, session.user.id);
    void logActivity({
      actorId: session.user.id,
      action: "media.uploaded",
      entityType: "Media",
      entityId: media.id,
    }).catch((err) => console.error("Failed to log media upload activity", err));
    return jsonOk(media);
  } catch (e) {
    return toErrorResponse(e);
  }
}
