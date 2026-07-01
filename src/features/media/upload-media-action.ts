"use server";

import { auth } from "@/lib/auth/config";
import { uploadMedia } from "@/lib/services/media.service";
import { AppError } from "@/lib/errors";

export type UploadedMediaPayload = {
  id: string;
  filename: string;
  path: string;
  webpPath: string | null;
  alt: string | null;
  mime: string;
};

export type UploadMediaActionResult =
  | { ok: true; data: UploadedMediaPayload }
  | { ok: false; message: string };

export async function uploadMediaAction(formData: FormData): Promise<UploadMediaActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Authentication required" };
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return { ok: false, message: "No file received" };
  }

  const uploadFile = file as File;
  if (!uploadFile.size) {
    return { ok: false, message: "File is empty" };
  }

  try {
    const media = await uploadMedia(uploadFile, session.user.id);
    return {
      ok: true,
      data: {
        id: media.id,
        filename: media.filename,
        path: media.path,
        webpPath: media.webpPath,
        alt: media.alt,
        mime: media.mime,
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, message: error.message };
    }
    if (error instanceof Error) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "Upload failed" };
  }
}
