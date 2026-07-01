import { AdminHeader } from "@/components/admin/admin-header";
import { TestimonialsEditor } from "@/components/admin/testimonials/testimonials-editor";
import { getAdminTestimonialsEditorData } from "@/features/testimonials/get-testimonials-data";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const initialData = await getAdminTestimonialsEditorData();

  return (
    <>
      <AdminHeader title="Testimonials" />
      <main className="flex-1 overflow-y-auto p-6">
        <TestimonialsEditor initialData={initialData} />
      </main>
    </>
  );
}
