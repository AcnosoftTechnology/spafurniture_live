import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { BlogImportWizard } from "@/components/admin/blog-import-wizard";
import { SpadataImportPanel } from "@/components/admin/spadata-import-panel";
import { WORDPRESS_IMPORT_ENABLED } from "@/lib/admin-feature-flags";

export default function BlogImportPage() {
  if (!WORDPRESS_IMPORT_ENABLED) notFound();

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
