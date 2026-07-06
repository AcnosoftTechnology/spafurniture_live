/**
 * Reset an admin user's password from the CLI (local or production server).
 *
 * Usage:
 *   npx tsx scripts/reset-admin-password.ts admin@spafurniture.local "NewPassword123"
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] ?? "admin@spafurniture.local").trim().toLowerCase();
  const password = process.argv[3];

  if (!password || password.length < 8) {
    console.error("Usage: npx tsx scripts/reset-admin-password.ts <email> <new-password>");
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email: ${email}`);
    console.error("Run: npm run db:seed  (creates admin@spafurniture.local)");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, status: "ACTIVE" },
  });

  console.log(`Password updated for ${email} (${user.role}, status ACTIVE)`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
