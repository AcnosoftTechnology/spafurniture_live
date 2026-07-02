"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  HelpCircle,
  MessageSquare,
  MessagesSquare,
  Image as ImageIcon,
  FileStack,
  Users,
  Settings,
  Upload,
  Activity,
  Home,
  Info,
  UsersRound,
  BookOpen,
  MessageCircle,
  CalendarDays,
  CalendarRange,
  Globe,
  Database,
} from "lucide-react";
import { cn, mediaUrl } from "@/lib/utils";
import type { SiteConfig } from "@/features/settings/schemas/site-config.schema";

const navItems = [
  { href: "/admin/dashboard/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/homepage/", label: "Homepage", icon: Home },
  { href: "/admin/about/", label: "About Us", icon: Info },
  { href: "/admin/clients/", label: "Clients", icon: UsersRound },
  { href: "/admin/distributors/", label: "Distributors", icon: Globe },
  { href: "/admin/testimonials/", label: "Testimonials", icon: MessageCircle },
  { href: "/admin/brochure/", label: "Brochure", icon: BookOpen },
  { href: "/admin/shows-exhibitions/", label: "Shows & Exhibitions", icon: CalendarDays },
  { href: "/admin/events/", label: "Events", icon: CalendarRange },
  { href: "/admin/products/", label: "Products", icon: Package },
  { href: "/admin/categories/", label: "Categories", icon: FolderTree },
  { href: "/admin/blog/", label: "Blog", icon: FileText },
  { href: "/admin/blog/comments/", label: "Blog Comments", icon: MessagesSquare },
  { href: "/admin/faq-groups/", label: "FAQ Groups", icon: HelpCircle },
  { href: "/admin/inquiries/", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/media/", label: "Media", icon: ImageIcon },
  { href: "/admin/seo-pages/", label: "Pages", icon: FileStack },
  { href: "/admin/import/blog/", label: "WordPress Import", icon: Upload },
  { href: "/admin/migrations/", label: "Database", icon: Database },
  { href: "/admin/users/", label: "Users", icon: Users },
  { href: "/admin/activity/", label: "Activity", icon: Activity },
  { href: "/admin/settings/", label: "Settings", icon: Settings },
] as const;

function normalizePath(pathname: string) {
  return pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
}

export function AdminSidebar({ site }: { site: SiteConfig }) {
  const pathname = usePathname();
  const normalizedPathname = normalizePath(pathname);
  const adminLogo = site.branding.adminLogoPath || site.branding.siteLogoPath;

  return (
    <aside className="flex h-full w-56 flex-col border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
      <div className="border-b border-stone-200 px-4 py-4 dark:border-stone-800">
        <Link href="/admin/dashboard/" className="block">
          {adminLogo ? (
            <Image
              src={mediaUrl(adminLogo)}
              alt={site.name || "Admin"}
              width={160}
              height={48}
              className="h-10 w-auto max-w-[160px] object-contain object-left"
            />
          ) : (
            <span className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              {site.name || "Esthetica CMS"}
            </span>
          )}
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-stone-400">Enterprise Admin</p>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const normalizedHref = normalizePath(item.href);
          const active =
            normalizedPathname === normalizedHref || normalizedPathname.startsWith(`${normalizedHref}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                active
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-900",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-stone-200 p-3 dark:border-stone-800">
        <p className="text-[10px] text-stone-400">CMS only · Public site optional</p>
      </div>
    </aside>
  );
}
