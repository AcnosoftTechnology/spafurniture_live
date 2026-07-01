import { getFaqGroupByShortcodeId } from "@/lib/services/faq-group.service";
import { FaqAccordion } from "@/components/site/faq-accordion";

export async function FaqAccordionBlock({ shortcodeId }: { shortcodeId: number }) {
  const group = await getFaqGroupByShortcodeId(shortcodeId);
  if (!group?.items.length) {
    return (
      <p className="esth-faq-accordion-missing text-sm text-stone-500">
        FAQ group #{shortcodeId} not found. Import FAQ groups from spadata or create one in admin.
      </p>
    );
  }

  return (
    <FaqAccordion
      items={group.items.map((item) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
      }))}
    />
  );
}
