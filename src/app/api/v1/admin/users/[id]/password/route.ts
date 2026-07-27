import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAdminRole, jsonError, jsonOk } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/services/activity.service";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdminRole("ADMIN");
  if (error || !session) return error;

  const { id } = await params;
  const body = schema.parse(await request.json());
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true },
  });

  if (!user) {
    return jsonError("NOT_FOUND", "User not found", 404);
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await logActivity({
    actorId: session.user.id,
    action: "user.password.updated",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email },
  });

  return jsonOk({ updated: true });
}
