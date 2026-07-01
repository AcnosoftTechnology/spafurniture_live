import Busboy from "busboy";
import { Readable } from "node:stream";
import { MAX_MEDIA_UPLOAD_BYTES, MAX_MEDIA_UPLOAD_MB } from "@/lib/media-types";

export type ParsedMultipartFile = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

/**
 * Parse multipart uploads without request.formData() (avoids Next.js / middleware issues).
 */
export async function parseMultipartUpload(
  request: Request,
  fieldName = "file",
): Promise<ParsedMultipartFile> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    throw new Error("Expected a multipart file upload");
  }

  const body = request.body;
  if (!body) {
    throw new Error("Request body is empty");
  }

  return new Promise((resolve, reject) => {
    const bb = Busboy({
      headers: { "content-type": contentType },
      limits: { fileSize: MAX_MEDIA_UPLOAD_BYTES },
    });

    let settled = false;
    let parsed: ParsedMultipartFile | null = null;

    bb.on("file", (name, stream, info) => {
      if (name !== fieldName) {
        stream.resume();
        return;
      }

      const chunks: Buffer[] = [];
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("limit", () => {
        if (!settled) {
          settled = true;
          reject(new Error(`File exceeds ${MAX_MEDIA_UPLOAD_MB}MB limit`));
        }
      });
      stream.on("end", () => {
        parsed = {
          buffer: Buffer.concat(chunks),
          filename: info.filename || "upload",
          mimeType: info.mimeType || "application/octet-stream",
        };
      });
    });

    bb.on("error", (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });

    bb.on("finish", () => {
      if (settled) return;
      settled = true;
      if (!parsed?.buffer.length) {
        reject(new Error("No file received"));
        return;
      }
      resolve(parsed);
    });

    Readable.fromWeb(body as Parameters<typeof Readable.fromWeb>[0]).pipe(bb);
  });
}
