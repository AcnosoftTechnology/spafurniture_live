import { AdminProviders } from "@/components/providers/admin-providers";

export const dynamic = "force-dynamic";

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
