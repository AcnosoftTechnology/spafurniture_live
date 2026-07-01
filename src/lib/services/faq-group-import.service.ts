import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { parseAccordionItemsFromPhpMeta } from "@/lib/php-accordion-parse";
import { parseWxrXml } from "@/lib/services/wxr-parse-core";
import type { StepStats } from "@/lib/services/spadata-import.service";

const FAQ_GROUP_FILE = "faq_group.xml";

export async function importFaqGroupsFromSpadata(
  options: { dryRun: boolean; overwrite: boolean },
  stats: StepStats,
): Promise<void> {
  const filePath = path.join(process.cwd(), "spadata", FAQ_GROUP_FILE);
  let xml: string;
  try {
    xml = await fs.readFile(filePath, "utf8");
  } catch {
    stats.errors.push({ title: FAQ_GROUP_FILE, message: "File not found" });
    return;
  }

  const items = parseWxrXml(xml, { postTypes: ["sp_easy_accordion"] });

  for (const item of items) {
    const title = item.title || `FAQ Group ${item.wpPostId}`;
    const postId = Number.parseInt(item.wpPostId, 10);
    if (!Number.isFinite(postId)) {
      stats.skipped++;
      continue;
    }

    const uploadRaw = item.postmeta.sp_eap_upload_options ?? item.postmeta.sp_eap_options ?? "";
    const faqItems = parseAccordionItemsFromPhpMeta(uploadRaw);

    if (!faqItems.length) {
      stats.skipped++;
      continue;
    }

    try {
      const existing = await prisma.faqGroup.findUnique({ where: { shortcodeId: postId } });

      if (existing && !options.overwrite) {
        stats.skipped++;
        continue;
      }

      if (options.dryRun) {
        stats.created++;
        continue;
      }

      if (existing) {
        await prisma.faq.deleteMany({ where: { faqGroupId: existing.id } });
        await prisma.faqGroup.update({
          where: { id: existing.id },
          data: { name: title },
        });
        await prisma.faq.createMany({
          data: faqItems.map((row, index) => ({
            entityType: "FAQ_GROUP",
            entityId: existing.id,
            faqGroupId: existing.id,
            question: row.question,
            answer: row.answer,
            sortOrder: index,
            schemaEnabled: true,
          })),
        });
        stats.updated++;
      } else {
        const group = await prisma.faqGroup.create({
          data: { name: title, shortcodeId: postId },
        });
        await prisma.faq.createMany({
          data: faqItems.map((row, index) => ({
            entityType: "FAQ_GROUP",
            entityId: group.id,
            faqGroupId: group.id,
            question: row.question,
            answer: row.answer,
            sortOrder: index,
            schemaEnabled: true,
          })),
        });
        stats.created++;
      }
    } catch (e) {
      stats.failed++;
      stats.errors.push({
        title,
        message: e instanceof Error ? e.message : "Import failed",
      });
    }
  }
}

/** Fallback parser hook if WXR filter misses post types — scan raw items. */
export function parseSpEasyAccordionItemsFromXml(xmlText: string) {
  const items = parseWxrXml(xmlText);
  return items.filter((i) => i.postType === "sp_easy_accordion" || i.postType?.includes("accordion"));
}
