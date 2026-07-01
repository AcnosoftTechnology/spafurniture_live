import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import {
  parseBlogCsv,
  createImportJob,
  runBlogImport,
  runWxrBlogImport,
  parseWxrBlogItems,
  type BlogImportMapping,
} from "@/lib/services/import.service";
import { isWordPressExportXml } from "@/lib/services/wxr-parser.service";
import { z } from "zod";

const schema = z.object({
  /** Raw file text (CSV or WordPress WXR XML) */
  csv: z.string().min(1),
  format: z.enum(["csv", "wxr", "auto"]).default("auto"),
  mapping: z.record(z.string(), z.string()).optional(),
  overwrite: z.boolean().default(false),
  dryRun: z.boolean().default(false),
});

export async function POST(request: Request) {
  const { session, error } = await requireAdminSession();
  if (error || !session) return error;

  const body = schema.safeParse(await request.json());
  if (!body.success) return jsonError("VALIDATION_ERROR", body.error.message, 400);

  const { csv: fileText, format, overwrite, dryRun } = body.data;
  const useWxr =
    format === "wxr" || (format === "auto" && isWordPressExportXml(fileText));

  const job = await createImportJob(
    useWxr ? "wordpress-export.xml" : "import.csv",
    session.user.id,
  );

  try {
    if (useWxr) {
      const items = parseWxrBlogItems(fileText);
      const stats = await runWxrBlogImport({
        jobId: job.id,
        items,
        overwrite,
        dryRun,
        defaultAuthorId: session.user.id,
      });
      return jsonOk({
        jobId: job.id,
        format: "wxr",
        postsFound: items.length,
        stats,
      });
    }

    const rows = parseBlogCsv(fileText);
    const m = body.data.mapping ?? {};
    if (!m.title) {
      return jsonError(
        "VALIDATION_ERROR",
        "Column mapping required for CSV. Map at least the Title column.",
        400,
      );
    }

    const stats = await runBlogImport({
      jobId: job.id,
      rows,
      mapping: m as BlogImportMapping,
      overwrite,
      dryRun,
      defaultAuthorId: session.user.id,
    });

    return jsonOk({
      jobId: job.id,
      format: "csv",
      postsFound: rows.length,
      stats,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import parse failed";
    return jsonError("PARSE_ERROR", message, 400);
  }
}
