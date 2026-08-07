import { requireAdminRole, jsonError } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { logActivity } from "@/lib/services/activity.service";
import {
  runBackupJob,
  type BackupProgressEvent,
} from "@/lib/services/backup.service";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 600;

const schema = z.object({
  includeDatabase: z.boolean().default(true),
  includeUploads: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdminRole("ADMIN");
    if (error || !session) return error;

    const body = schema.safeParse(await request.json().catch(() => ({})));
    if (!body.success) return jsonError("VALIDATION_ERROR", body.error.message, 400);

    if (!body.data.includeDatabase && !body.data.includeUploads) {
      return jsonError("VALIDATION_ERROR", "Select Database and/or Files (uploads).", 400);
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: BackupProgressEvent) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        };

        try {
          const result = await runBackupJob(
            {
              includeDatabase: body.data.includeDatabase,
              includeUploads: body.data.includeUploads,
            },
            send,
          );

          await logActivity({
            actorId: session.user.id,
            action: "backup.created",
            entityType: "Backup",
            entityId: result.jobId,
            metadata: {
              filename: result.filename,
              sizeBytes: result.sizeBytes,
              includeDatabase: body.data.includeDatabase,
              includeUploads: body.data.includeUploads,
            },
          });

          send({
            type: "complete",
            stage: "done",
            message: "Backup complete — ready to download",
            percent: 100,
            jobId: result.jobId,
            filename: result.filename,
            downloadPath: `/api/v1/admin/backup/${result.jobId}/download`,
            sizeBytes: result.sizeBytes,
          });
        } catch (err) {
          send({
            type: "error",
            message: err instanceof Error ? err.message : "Backup failed",
            percent: 0,
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}
