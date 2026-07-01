import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { createImportJob } from "@/lib/services/import.service";
import {
  listSpadataFiles,
  runSpadataImport,
  type SpadataImportStep,
} from "@/lib/services/spadata-import.service";

const schema = z.object({
  dryRun: z.boolean().default(true),
  overwrite: z.boolean().default(false),
  skipMedia: z.boolean().default(false),
  mediaLimit: z.number().int().positive().optional(),
  steps: z
    .array(z.enum(["media", "posts", "pages", "products", "faqGroups"]))
    .optional(),
});

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const files = await listSpadataFiles();
  return jsonOk(files);
}

export async function POST(request: Request) {
  const { session, error } = await requireAdminSession();
  if (error || !session) return error;

  const body = schema.safeParse(await request.json());
  if (!body.success) return jsonError("VALIDATION_ERROR", body.error.message, 400);

  if (body.data.dryRun && body.data.skipMedia) {
    /* allowed */
  }

  const job = await createImportJob("spadata-folder", session.user.id);

  try {
    const stats = await runSpadataImport({
      dryRun: body.data.dryRun,
      overwrite: body.data.overwrite,
      skipMedia: body.data.skipMedia,
      mediaLimit: body.data.mediaLimit,
      authorId: session.user.id,
      steps: body.data.steps as SpadataImportStep[] | undefined,
    });

    if (!body.data.dryRun) {
      revalidatePath("/blog");
      revalidatePath("/");
      revalidatePath("/products");
    }

    return jsonOk({ jobId: job.id, stats });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Spadata import failed";
    return jsonError("IMPORT_FAILED", message, 500);
  }
}
