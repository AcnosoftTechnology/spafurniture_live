import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/utils";

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: true };

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const resetUrl = `${getBaseUrl()}/admin/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  await sendPasswordResetEmail(email, resetUrl);
  return { ok: true };
}

export async function resetPassword(token: string, email: string, newPassword: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid request");

  const record = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) throw new Error("Invalid or expired token");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { ok: true };
}
