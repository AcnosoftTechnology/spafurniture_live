import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getSiteFaviconMetadata } from "@/lib/favicon";
import { getSiteConfig } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return { icons: await getSiteFaviconMetadata() };
}

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteConfig();

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      <AdminSidebar site={site} />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
