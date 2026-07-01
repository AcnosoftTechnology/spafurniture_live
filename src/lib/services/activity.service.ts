import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function logActivity(params: {
  actorId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}) {
  return prisma.activityLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      ip: params.ip,
    },
  });
}
