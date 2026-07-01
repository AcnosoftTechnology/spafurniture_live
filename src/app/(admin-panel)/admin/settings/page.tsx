import { AdminHeader } from "@/components/admin/admin-header";
import { SettingsEditor } from "@/components/admin/settings/settings-editor";
import { getAdminSettingsEditorData } from "@/features/settings/get-settings-data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const initialData = await getAdminSettingsEditorData();

  return (
    <>
      <AdminHeader title="Settings" />
      <main className="flex-1 overflow-y-auto p-6">
        <SettingsEditor initialData={initialData} />
      </main>
    </>
  );
}
