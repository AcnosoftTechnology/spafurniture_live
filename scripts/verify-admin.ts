import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@spafurniture.local";
  const password = "Admin@123456";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("FAIL: No user with email", email);
    return;
  }
  console.log("User found:", user.email, user.status, user.role);
  const ok = await bcrypt.compare(password, user.passwordHash);
  console.log("Password Admin@123456 matches:", ok);
}

main()
  .finally(() => prisma.$disconnect());
