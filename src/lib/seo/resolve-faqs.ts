import { prisma } from "@/lib/prisma";
import { extractSpEasyAccordionIds } from "@/lib/faq-shortcode";
import { tiptapToPlainText } from "@/lib/seo/tiptap-plain";
import { stripHtmlForSchema } from "@/lib/seo/schema";

export type SchemaFaqItem = { question: string; answer: string };

function contentToSearchableText(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  const plain = tiptapToPlainText(content, 0);
  if (plain) return plain;
  try {
    return JSON.stringify(content);
  } catch {
    return "";
  }
}

function normalizeFaqItems(
  items: Array<{ question: string; answer: string }>,
): SchemaFaqItem[] {
  return items
    .map((item) => ({
      question: item.question.trim(),
      answer: stripHtmlForSchema(item.answer),
    }))
    .filter((item) => item.question && item.answer);
}

function dedupeFaqs(items: SchemaFaqItem[]): SchemaFaqItem[] {
  const seen = new Set<string>();
  const merged: SchemaFaqItem[] = [];
  for (const item of items) {
    const key = `${item.question.toLowerCase()}::${item.answer.slice(0, 120).toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

/** FAQs linked directly to a product (`entityType: PRODUCT`). */
export async function getProductDirectFaqs(productId: string): Promise<SchemaFaqItem[]> {
  const rows = await prisma.faq
    .findMany({
      where: { entityType: "PRODUCT", entityId: productId, schemaEnabled: true },
      orderBy: { sortOrder: "asc" },
    })
    .catch(() => []);
  return normalizeFaqItems(rows);
}

/** FAQs from `[sp_easyaccordion id="…"]` blocks inside product/page HTML or TipTap content. */
export async function getFaqGroupFaqsFromContent(content: unknown): Promise<SchemaFaqItem[]> {
  const shortcodeIds = extractSpEasyAccordionIds(contentToSearchableText(content));
  if (!shortcodeIds.length) return [];

  const groups = await prisma.faqGroup
    .findMany({
      where: { shortcodeId: { in: shortcodeIds } },
      include: {
        items: {
          where: { schemaEnabled: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    })
    .catch(() => []);

  const ordered = shortcodeIds.flatMap((id) => {
    const group = groups.find((g) => g.shortcodeId === id);
    return group?.items ?? [];
  });

  return normalizeFaqItems(ordered);
}

export async function resolveProductFaqsForSchema(product: {
  id: string;
  fullDesc?: unknown;
}): Promise<SchemaFaqItem[]> {
  const [direct, fromContent] = await Promise.all([
    getProductDirectFaqs(product.id),
    getFaqGroupFaqsFromContent(product.fullDesc),
  ]);
  return dedupeFaqs([...direct, ...fromContent]);
}

export async function resolveCategoryFaqsForSchema(category: {
  id: string;
  pageContent?: unknown;
  description?: string | null;
}): Promise<SchemaFaqItem[]> {
  const rows = await prisma.faq
    .findMany({
      where: { entityType: "CATEGORY", entityId: category.id, schemaEnabled: true },
      orderBy: { sortOrder: "asc" },
    })
    .catch(() => []);

  const fromContent = await getFaqGroupFaqsFromContent(
    category.pageContent ?? category.description ?? "",
  );

  return dedupeFaqs([...normalizeFaqItems(rows), ...fromContent]);
}
