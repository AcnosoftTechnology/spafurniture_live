import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { getFaqGroupById } from "@/lib/services/faq-group.service";
import { FaqGroupForm } from "@/components/admin/faq-groups/faq-group-form";

export default async function EditFaqGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await getFaqGroupById(id);
  if (!group) notFound();

  return (
    <>
      <AdminHeader title={group.name || "Edit FAQ group"} />
      <main className="flex-1 overflow-y-auto p-6">
        <FaqGroupForm
          initial={{
            id: group.id,
            name: group.name,
            shortcodeId: group.shortcodeId,
            items: group.items.map((item) => ({
              question: item.question,
              answer: item.answer,
              sortOrder: item.sortOrder,
            })),
          }}
        />
      </main>
    </>
  );
}
