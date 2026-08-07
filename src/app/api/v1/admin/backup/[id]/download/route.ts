import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { requireAdminRole, jsonError } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { getBackupZipPath } from "@/lib/services/backup.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdminRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const file = await getBackupZipPath(id);
    if (!file) return jsonError("NOT_FOUND", "Backup not found or expired.", 404);

    const nodeStream = createReadStream(file.zipPath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}
