import { MAX_MEDIA_UPLOAD_MB } from "@/lib/media-types";

/** Map thrown Server Action / network errors to a user-facing upload message. */
export function uploadErrorMessage(err: unknown, fallback = "Upload failed — try again"): string {
  if (!(err instanceof Error)) return fallback;
  const msg = err.message.trim();
  if (!msg) return fallback;
  if (/body exceeded|bodysizelimit|413/i.test(msg)) {
    return `File is too large. Maximum size is ${MAX_MEDIA_UPLOAD_MB} MB.`;
  }
  if (/failed to fetch|network/i.test(msg)) {
    return "Network error — check your connection and try again.";
  }
  return msg;
}
