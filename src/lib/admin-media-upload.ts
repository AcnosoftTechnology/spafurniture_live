import { adminApiUrl } from "@/lib/utils";

export type UploadedMediaPayload = {
  id: string;
  filename: string;
  path: string;
  webpPath: string | null;
  alt: string | null;
  mime: string;
};

export type UploadMediaResult =
  | { ok: true; data: UploadedMediaPayload }
  | { ok: false; message: string };

/** Upload a file via the admin media API (avoids Server Action 404/size issues). */
export async function uploadMediaFile(file: File): Promise<UploadMediaResult> {
  const form = new FormData();
  form.append("file", file, file.name);

  let res: Response;
  try {
    res = await fetch(adminApiUrl("/api/upload"), {
      method: "POST",
      body: form,
      credentials: "include",
    });
  } catch {
    return { ok: false, message: "Network error — check your connection and try again." };
  }

  const json = (await res.json().catch(() => null)) as {
    data?: UploadedMediaPayload;
    error?: { message?: string };
  } | null;

  if (!res.ok) {
    return { ok: false, message: json?.error?.message ?? `Upload failed (${res.status})` };
  }

  if (!json?.data?.id) {
    return { ok: false, message: "Upload succeeded but server returned invalid data." };
  }

  return { ok: true, data: json.data };
}
