import { AdminHeader } from "@/components/admin/admin-header";
import { MigrationStatusBanner } from "@/components/admin/migrations/migration-status-banner";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { getDashboardStats } from "@/lib/services/dashboard.service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats;
  try {
    stats = await getDashboardStats();
  } catch {
    stats = {
      products: 0,
      categories: 0,
      blogs: 0,
      inquiries: 0,
      newInquiries: 0,
      recentInquiries: [],
      recentActivity: [],
      recentLogins: [],
      inquiryTrend: [],
    };
  }

  return (
    <>
      <AdminHeader title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-6">
        <MigrationStatusBanner />
        <DashboardStats stats={stats} />
      </main>
    </>
  );
}
