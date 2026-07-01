/**
 * CLI: Import WordPress XML from ./spadata/
 * Usage: npm run import:spadata -- --dry-run
 *        npm run import:spadata -- --run --overwrite
 */
import { PrismaClient } from "@prisma/client";
import { runSpadataImport } from "../src/lib/services/spadata-import.service";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--run");
  const overwrite = args.includes("--overwrite");
  const skipMedia = args.includes("--skip-media");

  const admin =
    (await prisma.user.findFirst({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    })) ??
    (await prisma.user.findFirst({ orderBy: { createdAt: "asc" } }));

  if (!admin) {
    console.error(
      "No user in database. Create one with:\n  npm run db:seed\n\nDefault login: admin@spafurniture.local / Admin@123456",
    );
    process.exit(1);
  }

  console.log(`Using author: ${admin.email} (${admin.role})`);

  console.log(dryRun ? "DRY RUN" : "LIVE IMPORT", { overwrite, skipMedia });

  const stats = await runSpadataImport({
    dryRun,
    overwrite,
    skipMedia,
    authorId: admin.id,
  });

  console.log(JSON.stringify(stats, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
