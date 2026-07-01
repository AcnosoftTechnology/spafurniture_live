import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { formatSpEasyAccordionShortcode } from "@/lib/faq-shortcode";

export type FaqGroupItemInput = {
  id?: string;
  question: string;
  answer: string;
  sortOrder?: number;
  schemaEnabled?: boolean;
};

export async function listFaqGroups() {
  return prisma.faqGroup.findMany({
    orderBy: { shortcodeId: "desc" },
    include: {
      _count: { select: { items: true } },
    },
  });
}

export async function getFaqGroupByShortcodeId(shortcodeId: number) {
  return prisma.faqGroup.findUnique({
    where: { shortcodeId },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getFaqGroupById(id: string) {
  return prisma.faqGroup.findUnique({
    where: { id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function nextFaqGroupShortcodeId(): Promise<number> {
  const row = await prisma.faqGroup.aggregate({ _max: { shortcodeId: true } });
  const base = row._max.shortcodeId ?? 6000;
  return base + 1;
}

export async function saveFaqGroup(
  id: string | null,
  data: { name: string; shortcodeId?: number; items: FaqGroupItemInput[] },
) {
  const shortcodeId =
    data.shortcodeId ??
    (id
      ? (await prisma.faqGroup.findUnique({ where: { id }, select: { shortcodeId: true } }))?.shortcodeId
      : null) ??
    (await nextFaqGroupShortcodeId());

  return prisma.$transaction(async (tx) => {
    let groupId = id;

    if (groupId) {
      await tx.faqGroup.update({
        where: { id: groupId },
        data: { name: data.name, shortcodeId },
      });
      await tx.faq.deleteMany({ where: { faqGroupId: groupId } });
    } else {
      const created = await tx.faqGroup.create({
        data: { name: data.name, shortcodeId },
      });
      groupId = created.id;
    }

    if (data.items.length) {
      await tx.faq.createMany({
        data: data.items.map((item, index) => ({
          entityType: "FAQ_GROUP" as const,
          entityId: groupId!,
          faqGroupId: groupId!,
          question: item.question.trim(),
          answer: item.answer,
          sortOrder: item.sortOrder ?? index,
          schemaEnabled: item.schemaEnabled ?? true,
        })),
      });
    }

    return tx.faqGroup.findUnique({
      where: { id: groupId! },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
  });
}

export async function deleteFaqGroup(id: string) {
  await prisma.faqGroup.delete({ where: { id } });
}

/** Clone group + all FAQs with a new shortcode ID (WordPress-style duplicate). */
export async function duplicateFaqGroup(id: string) {
  const source = await getFaqGroupById(id);
  if (!source) {
    throw new AppError("NOT_FOUND", "FAQ group not found", 404);
  }

  const shortcodeId = await nextFaqGroupShortcodeId();
  const copyLabel = source.name.trim() || "FAQ group";
  const name = `Copy — ${copyLabel}`;

  return saveFaqGroup(null, {
    name,
    shortcodeId,
    items: source.items.map((item, index) => ({
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder ?? index,
      schemaEnabled: item.schemaEnabled,
    })),
  });
}

export function faqGroupShortcode(group: { shortcodeId: number }) {
  return formatSpEasyAccordionShortcode(group.shortcodeId);
}
