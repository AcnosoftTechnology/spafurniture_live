import "server-only";

import { createWriteStream, createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { ZipArchive } from "archiver";
import { env } from "@/lib/env";
import type { BackupOptions, BackupProgressEvent } from "@/lib/backup-types";

export type { BackupOptions, BackupProgressEvent } from "@/lib/backup-types";

function resolveProjectRoot() {
  // Keep Turbopack from tracing the whole project tree via process.cwd().
  const cwd = /* turbopackIgnore: true */ process.cwd();
  const standaloneSuffix = `${path.sep}.next${path.sep}standalone`;
  if (cwd.endsWith(standaloneSuffix)) {
    return path.resolve(/* turbopackIgnore: true */ cwd, "..", "..");
  }
  return cwd;
}

export function isWebBackupEnabled() {
  return process.env.DISABLE_WEB_BACKUPS !== "true";
}

export function getBackupsRoot() {
  return path.join(resolveProjectRoot(), "backups");
}

function getJobsRoot() {
  return path.join(getBackupsRoot(), "jobs");
}

function jobDir(jobId: string) {
  return path.join(getJobsRoot(), jobId);
}

export function createBackupJobId() {
  return `bk_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
}

async function cleanupOldJobs(maxAgeMs = 24 * 60 * 60 * 1000) {
  const root = getJobsRoot();
  let dirs: import("node:fs").Dirent[] = [];
  try {
    dirs = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return;
  }
  const now = Date.now();
  for (const entry of dirs) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(root, entry.name);
    try {
      const st = await fs.stat(dir);
      if (now - st.mtimeMs > maxAgeMs) {
        await fs.rm(dir, { recursive: true, force: true });
      }
    } catch {
      // ignore
    }
  }
}

function resolveUploadsDir() {
  return path.resolve(/* turbopackIgnore: true */ env.UPLOAD_DIR);
}

async function countFilesRecursive(dir: string): Promise<number> {
  let count = 0;
  let entries: import("node:fs").Dirent[] = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += await countFilesRecursive(full);
    else if (entry.isFile()) count += 1;
  }
  return count;
}

function runPgDump(outFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const customBin = process.env.PG_DUMP_PATH?.trim();
    // Literal "pg_dump" keeps Turbopack from tracing the whole filesystem.
    const child = customBin
      ? spawn(/* turbopackIgnore: true */ customBin, [
          env.DATABASE_URL,
          "--no-owner",
          "--no-acl",
          "--format=plain",
          `--file=${outFile}`,
        ], { env: process.env, windowsHide: true, shell: false })
      : spawn("pg_dump", [
          env.DATABASE_URL,
          "--no-owner",
          "--no-acl",
          "--format=plain",
          `--file=${outFile}`,
        ], { env: process.env, windowsHide: true, shell: false });

    const binLabel = customBin || "pg_dump";
    let stderr = "";
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => {
      reject(
        new Error(
          `Could not run pg_dump (${binLabel}). Install PostgreSQL client tools or set PG_DUMP_PATH. ${err.message}`,
        ),
      );
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `pg_dump exited with code ${code}`));
    });
  });
}

type Emit = (event: BackupProgressEvent) => void;

export async function getBackupEstimates() {
  const uploadsDir = resolveUploadsDir();
  let uploadsFiles = 0;
  let uploadsBytes = 0;
  let uploadsExists = false;

  try {
    await fs.access(uploadsDir);
    uploadsExists = true;
    uploadsFiles = await countFilesRecursive(uploadsDir);

    async function sumBytes(dir: string): Promise<number> {
      let total = 0;
      const entries = await fs.readdir(dir, { withFileTypes: true }).catch(
        () => [] as import("node:fs").Dirent[],
      );
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) total += await sumBytes(full);
        else if (entry.isFile()) {
          const st = await fs.stat(full).catch(() => null);
          if (st) total += st.size;
        }
      }
      return total;
    }
    uploadsBytes = await sumBytes(uploadsDir);
  } catch {
    // no uploads
  }

  return {
    webBackupEnabled: isWebBackupEnabled(),
    uploadsExists,
    uploadsDir,
    uploadsFiles,
    uploadsBytes,
    databaseConfigured: Boolean(env.DATABASE_URL),
  };
}

export async function runBackupJob(
  options: BackupOptions,
  emit: Emit,
): Promise<{ jobId: string; filename: string; zipPath: string; sizeBytes: number }> {
  if (!isWebBackupEnabled()) {
    throw new Error("Web backups are disabled on this server (DISABLE_WEB_BACKUPS=true).");
  }
  if (!options.includeDatabase && !options.includeUploads) {
    throw new Error("Select at least Database or Files (uploads).");
  }

  const jobId = createBackupJobId();
  const dir = jobDir(jobId);
  await fs.mkdir(dir, { recursive: true });
  await cleanupOldJobs().catch(() => undefined);

  emit({
    type: "progress",
    stage: "prepare",
    message: "Preparing backup job…",
    percent: 2,
    jobId,
  });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `spafurniture-backup-${stamp}.zip`;
  const zipPath = path.join(dir, filename);
  const staging: string[] = [];

  try {
    if (options.includeDatabase) {
      emit({
        type: "progress",
        stage: "database",
        message: "Dumping PostgreSQL database…",
        percent: 8,
        jobId,
      });
      const sqlPath = path.join(dir, "database.sql");
      await runPgDump(sqlPath);
      staging.push(sqlPath);
      emit({
        type: "progress",
        stage: "database",
        message: "Database dump complete",
        percent: 28,
        jobId,
      });
    }

    const uploadsDir = resolveUploadsDir();
    let uploadFileList: string[] = [];
    if (options.includeUploads) {
      emit({
        type: "progress",
        stage: "uploads",
        message: "Scanning upload files…",
        percent: 32,
        jobId,
      });
      try {
        await fs.access(uploadsDir);
        uploadFileList = await listFilesRecursive(uploadsDir);
      } catch {
        emit({
          type: "progress",
          stage: "uploads",
          message: "Uploads folder not found — skipping files",
          percent: 40,
          jobId,
        });
      }
    }

    emit({
      type: "progress",
      stage: "zip",
      message: "Creating ZIP archive…",
      percent: 42,
      jobId,
    });

    await createZipArchive({
      zipPath,
      sqlPath: options.includeDatabase ? path.join(dir, "database.sql") : null,
      uploadsDir: options.includeUploads ? uploadsDir : null,
      uploadFiles: uploadFileList,
      emit,
      jobId,
      basePercent: 42,
      endPercent: 96,
    });

    const st = await fs.stat(zipPath);

    // Remove staging SQL (keep zip only)
    for (const file of staging) {
      await fs.rm(file, { force: true }).catch(() => undefined);
    }

    await fs.writeFile(
      path.join(dir, "meta.json"),
      JSON.stringify(
        {
          jobId,
          filename,
          createdAt: new Date().toISOString(),
          includeDatabase: options.includeDatabase,
          includeUploads: options.includeUploads,
          sizeBytes: st.size,
          checksumSha256: await sha256File(zipPath),
        },
        null,
        2,
      ),
      "utf8",
    );

    emit({
      type: "progress",
      stage: "done",
      message: "Backup ready",
      percent: 100,
      jobId,
    });

    return { jobId, filename, zipPath, sizeBytes: st.size };
  } catch (err) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
    throw err;
  }
}

async function listFilesRecursive(dir: string, base = dir): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(
    () => [] as import("node:fs").Dirent[],
  );
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listFilesRecursive(full, base)));
    } else if (entry.isFile()) {
      out.push(path.relative(base, full));
    }
  }
  return out;
}

async function sha256File(filePath: string) {
  const hash = createHash("sha256");
  const stream = createReadStream(filePath);
  for await (const chunk of stream) {
    hash.update(chunk as Buffer);
  }
  return hash.digest("hex");
}

async function createZipArchive(opts: {
  zipPath: string;
  sqlPath: string | null;
  uploadsDir: string | null;
  uploadFiles: string[];
  emit: Emit;
  jobId: string;
  basePercent: number;
  endPercent: number;
}) {
  const { zipPath, sqlPath, uploadsDir, uploadFiles, emit, jobId, basePercent, endPercent } = opts;

  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = new ZipArchive({ zlib: { level: 6 } });

    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));
    archive.pipe(output);

    const totalSteps = (sqlPath ? 1 : 0) + uploadFiles.length;
    let done = 0;

    const bump = (file?: string) => {
      done += 1;
      const span = endPercent - basePercent;
      const percent =
        totalSteps === 0
          ? endPercent
          : Math.min(endPercent, Math.round(basePercent + (done / totalSteps) * span));
      emit({
        type: "progress",
        stage: "zip",
        message: file ? `Added ${file}` : "Packaging…",
        percent,
        current: done,
        total: Math.max(totalSteps, 1),
        file,
        jobId,
      });
    };

    if (sqlPath) {
      archive.file(sqlPath, { name: "database.sql" });
      bump("database.sql");
    }

    if (uploadsDir && uploadFiles.length) {
      let lastEmittedPercent = -1;
      for (let i = 0; i < uploadFiles.length; i++) {
        const rel = uploadFiles[i]!;
        const abs = path.join(uploadsDir, rel);
        archive.file(abs, { name: path.posix.join("uploads", rel.split(path.sep).join("/")) });
        done += 1;
        const span = endPercent - basePercent;
        const percent = Math.min(
          endPercent,
          Math.round(basePercent + (done / Math.max(totalSteps, 1)) * span),
        );
        // Throttle UI events for large libraries
        if (percent !== lastEmittedPercent || i === uploadFiles.length - 1 || i % 25 === 0) {
          lastEmittedPercent = percent;
          emit({
            type: "progress",
            stage: "zip",
            message: `Packing uploads (${done}/${uploadFiles.length})`,
            percent,
            current: done,
            total: Math.max(totalSteps, 1),
            file: rel,
            jobId,
          });
        }
      }
    } else if (uploadsDir) {
      // empty uploads dir marker
      archive.append("", { name: "uploads/.keep" });
    }

    archive.append(
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          site: process.env.NEXT_PUBLIC_SITE_URL ?? null,
          includeDatabase: Boolean(sqlPath),
          includeUploads: Boolean(uploadsDir),
          uploadFileCount: uploadFiles.length,
        },
        null,
        2,
      ),
      { name: "backup-manifest.json" },
    );

    void archive.finalize();
  });
}

export async function getBackupZipPath(jobId: string): Promise<{ zipPath: string; filename: string } | null> {
  if (!/^bk_[a-z0-9]+_[a-f0-9]+$/i.test(jobId)) return null;
  const dir = jobDir(jobId);
  const metaPath = path.join(dir, "meta.json");
  try {
    const raw = await fs.readFile(metaPath, "utf8");
    const meta = JSON.parse(raw) as { filename?: string };
    if (!meta.filename) return null;
    const zipPath = path.join(dir, meta.filename);
    await fs.access(zipPath);
    return { zipPath, filename: meta.filename };
  } catch {
    return null;
  }
}
