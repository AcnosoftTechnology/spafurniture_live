import { prisma } from "@/lib/prisma";
import type { InquiryStatus, InquiryType, Prisma } from "@prisma/client";

export async function createInquiry(data: {
  type?: InquiryType;
  name: string;
  email: string;
  country?: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  productId?: string;
  pageUrl?: string;
  ip?: string;
  userAgent?: string;
}) {
  return prisma.inquiry.create({
    data: {
      type: data.type ?? "GENERAL",
      name: data.name,
      email: data.email,
      country: data.country || null,
      phone: data.phone || null,
      company: data.company || null,
      subject: data.subject || null,
      message: data.message,
      productId: data.productId || null,
      pageUrl: data.pageUrl || null,
      ip: data.ip,
      userAgent: data.userAgent,
    },
  });
}

export async function listInquiries(params?: {
  status?: InquiryStatus;
  skip?: number;
  take?: number;
}) {
  return prisma.inquiry.findMany({
    where: params?.status ? { status: params.status } : undefined,
    orderBy: { createdAt: "desc" },
    skip: params?.skip ?? 0,
    take: params?.take ?? 50,
    include: { product: { select: { id: true, title: true, slug: true } } },
  });
}

export async function updateInquiryStatus(id: string, status: InquiryStatus, assignedToId?: string) {
  return prisma.inquiry.update({
    where: { id },
    data: { status, assignedToId },
  });
}

export async function getInquiryStats() {
  const [total, newCount, recent] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { product: { select: { title: true, slug: true } } },
    }),
  ]);
  return { total, newCount, recent };
}
