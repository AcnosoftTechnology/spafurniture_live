import { AdminHeader } from "@/components/admin/admin-header";
import { FaqGroupForm } from "@/components/admin/faq-groups/faq-group-form";

export default function NewFaqGroupPage() {
  return (
    <>
      <AdminHeader title="Add New FAQ Group" />
      <main className="flex-1 overflow-y-auto p-6">
        <FaqGroupForm />
      </main>
    </>
  );
}
