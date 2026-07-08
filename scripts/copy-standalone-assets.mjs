import { cpSync, existsSync, lstatSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { join, sep } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  console.log("[postbuild] No standalone output — skipping static copy.");
  process.exit(0);
}

const publicDir = join(root, "public");
const standalonePublic = join(standaloneDir, "public");
const uploadsDir = join(publicDir, "uploads");
const standaloneUploads = join(standalonePublic, "uploads");

const GENERATED_SITEMAP_FILES = new Set([
  "sitemap.xml",
  "sitemap_index.xml",
  "post-sitemap.xml",
  "page-sitemap.xml",
  "products-sitemap.xml",
]);

function isUploadsPath(absolutePath) {
  const normalized = absolutePath.split(sep).join(sep);
  const uploadsRoot = uploadsDir.split(sep).join(sep);
  return normalized === uploadsRoot || normalized.startsWith(`${uploadsRoot}${sep}`);
}

function isGeneratedSitemapPath(absolutePath) {
  const relative = absolutePath.slice(publicDir.length).replace(/^[/\\]+/, "");
  const parts = relative.split(/[/\\]/).filter(Boolean);
  return parts.length === 1 && GENERATED_SITEMAP_FILES.has(parts[0]);
}

cpSync(join(root, ".next", "static"), join(standaloneDir, ".next", "static"), { recursive: true });

cpSync(publicDir, standalonePublic, {
  recursive: true,
  filter: (src) => !isUploadsPath(src) && !isGeneratedSitemapPath(src),
});

mkdirSync(uploadsDir, { recursive: true });

if (existsSync(standaloneUploads)) {
  try {
    const stat = lstatSync(standaloneUploads);
    if (!stat.isSymbolicLink()) {
      rmSync(standaloneUploads, { recursive: true, force: true });
    }
  } catch {
    // fall through and recreate link below
  }
}

if (!existsSync(standaloneUploads)) {
  try {
    symlinkSync("../../../public/uploads", standaloneUploads, "dir");
    console.log("[postbuild] Linked standalone/public/uploads -> public/uploads");
  } catch {
    cpSync(uploadsDir, standaloneUploads, { recursive: true, force: false });
    console.log("[postbuild] Copied public/uploads into standalone (symlink unavailable)");
  }
}

cpSync(join(root, "prisma"), join(standaloneDir, "prisma"), { recursive: true });

console.log("[postbuild] Copied .next/static, public (except uploads), and prisma into .next/standalone/");
