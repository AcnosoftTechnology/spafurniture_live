import { prisma } from "@/lib/prisma";
import type { ContentStatus, Prisma } from "@prisma/client";

export async function listPages(params?: {
  search?: string;
  status?: ContentStatus;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 20));
  const where: Prisma.PageWhereInput = {};

  if (params?.status) where.status = params.status;
  if (params?.search?.trim()) {
    const q = params.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { ogImage: true },
    }),
    prisma.page.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getPageById(id: string) {
  return prisma.page.findUnique({
    where: { id },
    include: { ogImage: true },
  });
}

export async function getPageBySlug(slug: string) {
  return prisma.page.findUnique({
    where: { slug },
    include: { ogImage: true },
  });
}

export async function deletePage(id: string) {
  return prisma.page.delete({ where: { id } });
}

export async function deletePages(ids: string[]) {
  return prisma.page.deleteMany({ where: { id: { in: ids } } });
}
