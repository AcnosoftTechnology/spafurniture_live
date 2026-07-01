import { prisma } from "@/lib/prisma";
import type { ContentStatus, Prisma } from "@prisma/client";

export type ListEventsParams = {
  status?: ContentStatus;
  search?: string;
  skip?: number;
  take?: number;
};

function buildEventWhere(params?: ListEventsParams): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {};
  if (params?.status) where.status = params.status;
  if (params?.search?.trim()) {
    where.title = { contains: params.search.trim(), mode: "insensitive" };
  }
  return where;
}

export async function listEvents(params?: ListEventsParams) {
  return prisma.event.findMany({
    where: buildEventWhere(params),
    orderBy: { eventDate: "desc" },
    skip: params?.skip ?? 0,
    take: params?.take ?? 20,
    include: {
      imageMedia: true,
    },
  });
}

export async function countEvents(params?: ListEventsParams) {
  return prisma.event.count({ where: buildEventWhere(params) });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: { imageMedia: true },
  });
}
