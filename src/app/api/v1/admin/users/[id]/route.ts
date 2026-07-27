import { z } from "zod";
import { requireAdminRole, jsonError, jsonOk } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/services/activity.service";
import { toErrorResponse } from "@/lib/errors";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").transform((v) => v.toLowerCase()),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    if (body.email === user.email) {
      return jsonOk({ id: user.id, email: user.email });
    }

    const existing = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true },
    });
    if (existing && existing.id !== user.id) {
      return jsonError("CONFLICT", "This email is already in use", 409);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { email: body.email },
      select: { id: true, email: true },
    });

    await logActivity({
      actorId: session.user.id,
      action: "user.email.updated",
      entityType: "User",
      entityId: user.id,
      metadata: { from: user.email, to: updated.email },
    });

    return jsonOk(updated);
  } catch (e) {
    return toErrorResponse(e);
  }
}
