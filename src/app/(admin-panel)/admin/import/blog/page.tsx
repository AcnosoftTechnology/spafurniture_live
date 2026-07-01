import { AdminHeader } from "@/components/admin/admin-header";
import { BlogImportWizard } from "@/components/admin/blog-import-wizard";
import { SpadataImportPanel } from "@/components/admin/spadata-import-panel";

export default function BlogImportPage() {
  return (
    <>
      <AdminHeader title="WordPress Import" />
      <main className="flex-1 overflow-y-auto space-y-6 p-6">
        <SpadataImportPanel />
        <BlogImportWizard />
      </main>
    </>
  );
}
