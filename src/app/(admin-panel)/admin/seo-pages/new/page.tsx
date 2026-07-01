import { AdminHeader } from "@/components/admin/admin-header";
import { PageFormEnterprise } from "@/components/admin/pages/page-form-enterprise";

export default function NewSeoPage() {
  return (
    <>
      <AdminHeader title="New SEO Page" />
      <main className="flex-1 overflow-y-auto p-6">
        <PageFormEnterprise />
      </main>
    </>
  );
}
