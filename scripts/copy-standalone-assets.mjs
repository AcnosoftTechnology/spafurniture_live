import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  console.log("[postbuild] No standalone output — skipping static copy.");
  process.exit(0);
}

cpSync(join(root, ".next", "static"), join(standaloneDir, ".next", "static"), { recursive: true });
cpSync(join(root, "public"), join(standaloneDir, "public"), { recursive: true });

console.log("[postbuild] Copied .next/static and public into .next/standalone/");
