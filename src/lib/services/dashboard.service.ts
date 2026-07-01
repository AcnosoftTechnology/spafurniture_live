import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const [
    products,
    categories,
    blogs,
    inquiries,
    newInquiries,
    recentInquiries,
    recentActivity,
    recentLogins,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.blogPost.count(),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { title: true } } },
    }),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.loginActivity.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const inquiryTrend = await prisma.$queryRaw<{ month: string; count: bigint }[]>`
    SELECT to_char("createdAt", 'YYYY-MM') as month, COUNT(*)::bigint as count
    FROM "Inquiry"
    WHERE "createdAt" > NOW() - INTERVAL '6 months'
    GROUP BY month
    ORDER BY month ASC
  `.catch(() => [] as { month: string; count: bigint }[]);

  return {
    products,
    categories,
    blogs,
    inquiries,
    newInquiries,
    recentInquiries,
    recentActivity,
    recentLogins,
    inquiryTrend: inquiryTrend.map((r) => ({
      month: r.month,
      count: Number(r.count),
    })),
  };
}
