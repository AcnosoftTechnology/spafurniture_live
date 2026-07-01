import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { env } from "@/lib/env";
import { MEDIA_EXT_TO_MIME } from "@/lib/media-types";

function mimeForFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return MEDIA_EXT_TO_MIME[ext] ?? "application/octet-stream";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const filename = segments.join("/");
  const uploadDir = path.resolve(env.UPLOAD_DIR);
  const filepath = path.join(uploadDir, filename);

  if (!filepath.startsWith(uploadDir)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const buffer = await fs.readFile(filepath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeForFilename(filename),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
