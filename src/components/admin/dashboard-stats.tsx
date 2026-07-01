"use client";

import Link from "next/link";
import { Package, FolderTree, FileText, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDistanceToNow } from "date-fns";

type DashboardStatsProps = {
  stats: {
    products: number;
    categories: number;
    blogs: number;
    inquiries: number;
    newInquiries: number;
    recentInquiries: Array<{
      id: string;
      name: string;
      email: string;
      status: string;
      createdAt: Date;
      product?: { title: string } | null;
    }>;
    recentActivity: Array<{
      id: string;
      action: string;
      entityType: string | null;
      createdAt: Date;
      actor?: { name: string } | null;
    }>;
    recentLogins: Array<{
      id: string;
      success: boolean;
      ip: string | null;
      createdAt: Date;
      user?: { name: string } | null;
    }>;
    inquiryTrend: Array<{ month: string; count: number }>;
  };
};

const kpis = [
  { key: "products", label: "Products", icon: Package, href: "/admin/products/" },
  { key: "categories", label: "Categories", icon: FolderTree, href: "/admin/categories/" },
  { key: "blogs", label: "Blog Posts", icon: FileText, href: "/admin/blog/" },
  { key: "inquiries", label: "Inquiries", icon: MessageSquare, href: "/admin/inquiries/" },
] as const;

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const value = stats[kpi.key as keyof typeof stats] as number;
          return (
            <Link key={kpi.key} href={kpi.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-stone-500">{kpi.label}</CardTitle>
                  <Icon className="h-4 w-4 text-stone-400" strokeWidth={1.75} />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{value}</p>
                  {kpi.key === "inquiries" && stats.newInquiries > 0 && (
                    <Badge variant="warning" className="mt-2">
                      {stats.newInquiries} new
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Inquiries (6 months)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {stats.inquiryTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.inquiryTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1c1917" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-stone-500">No inquiry data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentInquiries.map((inq) => (
              <div key={inq.id} className="flex items-start justify-between border-b border-stone-100 pb-2 last:border-0">
                <div>
                  <p className="text-xs font-medium">{inq.name}</p>
                  <p className="text-[10px] text-stone-500">{inq.email}</p>
                  {inq.product && <p className="text-[10px] text-stone-400">{inq.product.title}</p>}
                </div>
                <span className="text-[10px] text-stone-400">
                  {formatDistanceToNow(new Date(inq.createdAt), { addSuffix: true })}
                </span>
              </div>
            ))}
            {stats.recentInquiries.length === 0 && (
              <p className="text-xs text-stone-500">No inquiries yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.recentActivity.map((log) => (
              <div key={log.id} className="text-xs">
                <span className="font-medium">{log.actor?.name ?? "System"}</span>{" "}
                <span className="text-stone-500">{log.action}</span>
                <span className="block text-[10px] text-stone-400">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Login Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.recentLogins.map((log) => (
              <div key={log.id} className="flex justify-between text-xs">
                <span>
                  {log.user?.name ?? "Unknown"} — {log.success ? "Success" : "Failed"}
                </span>
                <span className="text-stone-400">{log.ip}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
