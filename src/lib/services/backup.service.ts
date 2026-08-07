import "server-only";

import { createWriteStream, createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { ZipArchive } from "archiver";
import { env } from "@/lib/env";
import type { BackupJobListItem, BackupOptions, BackupProgressEvent } from "@/lib/backup-types";

export type { BackupJobListItem, BackupOptions, BackupProgressEvent } from "@/lib/backup-types";

type BackupJobMeta = {
  jobId: string;
  filename: string;
  createdAt: string;
  includeDatabase: boolean;
  includeUploads: boolean;
  sizeBytes: number;
  checksumSha256?: string;
};

function isValidJobId(jobId: string) {
  return /^bk_[a-z0-9]+_[a-f0-9]+$/i.test(jobId);
}

function getRetentionMs() {
  const daysRaw = process.env.BACKUP_RETENTION_DAYS?.trim();
  const days = daysRaw ? Number(daysRaw) : 30;
  if (!Number.isFinite(days) || days <= 0) return 30 * 24 * 60 * 60 * 1000;
  return days * 24 * 60 * 60 * 1000;
}

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

async function cleanupOldJobs() {
  const root = getJobsRoot();
  let dirs: import("node:fs").Dirent[] = [];
  try {
    dirs = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return;
  }
  const now = Date.now();
  const completeMaxAge = getRetentionMs();
  const incompleteMaxAge = 6 * 60 * 60 * 1000;
  for (const entry of dirs) {
    if (!entry.isDirectory() || !isValidJobId(entry.name)) continue;
    const dir = path.join(root, entry.name);
    try {
      const st = await fs.stat(dir);
      const metaPath = path.join(dir, "meta.json");
      let hasMeta = false;
      try {
        await fs.access(metaPath);
        hasMeta = true;
      } catch {
        hasMeta = false;
      }
      const maxAge = hasMeta ? completeMaxAge : incompleteMaxAge;
      if (now - st.mtimeMs > maxAge) {
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

function formatBackupError(err: unknown): string {
  if (!(err instanceof Error)) return "Backup failed";
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as NodeJS.ErrnoException).code)
      : "";
  if (code === "ENOSPC") {
    return "Disk full while writing ZIP. Free space on the server (need roughly the size of uploads), then retry.";
  }
  if (code === "EMFILE" || code === "ENFILE") {
    return "Too many open files while packing uploads. Retry, or raise the server file-descriptor limit.";
  }
  return code ? `${err.message} (${code})` : err.message || "Backup failed";
}

async function assertEnoughDiskSpace(dir: string, neededBytes: number) {
  try {
    const stats = await fs.statfs(dir);
    const free = Number(stats.bavail) * Number(stats.bsize);
    // ZIP of media is often ~same size (store) — require 1.15x headroom
    const need = Math.ceil(neededBytes * 1.15);
    if (free < need) {
      throw Object.assign(
        new Error(
          `Not enough free disk space for backup. Free ~${Math.ceil(need / (1024 * 1024 * 1024))} GB, have ~${(
            free /
            (1024 * 1024 * 1024)
          ).toFixed(1)} GB.`,
        ),
        { code: "ENOSPC" },
      );
    }
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "ENOSPC") {
      throw err;
    }
    // statfs unsupported — continue
  }
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
    let uploadsBytes = 0;
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
        const listed = await listFilesRecursive(uploadsDir);
        uploadFileList = listed.files;
        uploadsBytes = listed.bytes;
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

    let sqlBytes = 0;
    if (options.includeDatabase) {
      const st = await fs.stat(path.join(dir, "database.sql")).catch(() => null);
      if (st) sqlBytes = st.size;
    }
    await assertEnoughDiskSpace(dir, uploadsBytes + sqlBytes);

    emit({
      type: "progress",
      stage: "zip",
      message: `Creating ZIP (${uploadFileList.length.toLocaleString()} files)…`,
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

    emit({
      type: "progress",
      stage: "zip",
      message: "ZIP written — finishing…",
      percent: 97,
      jobId,
    });

    const st = await fs.stat(zipPath);

    // Remove staging SQL (keep zip only)
    for (const file of staging) {
      await fs.rm(file, { force: true }).catch(() => undefined);
    }

    // Skip hashing multi-GB zips (can take many minutes and look like a hang).
    let checksumSha256: string | null = null;
    if (st.size <= 200 * 1024 * 1024) {
      emit({
        type: "progress",
        stage: "done",
        message: "Computing checksum…",
        percent: 98,
        jobId,
      });
      checksumSha256 = await sha256File(zipPath);
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
          checksumSha256,
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
    throw Object.assign(new Error(formatBackupError(err)), err instanceof Error ? { cause: err } : {});
  }
}

async function listFilesRecursive(
  dir: string,
  base = dir,
): Promise<{ files: string[]; bytes: number }> {
  const out: string[] = [];
  let bytes = 0;
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(
    () => [] as import("node:fs").Dirent[],
  );
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFilesRecursive(full, base);
      out.push(...nested.files);
      bytes += nested.bytes;
    } else if (entry.isFile()) {
      out.push(path.relative(base, full));
      const st = await fs.stat(full).catch(() => null);
      if (st) bytes += st.size;
    }
  }
  return { files: out, bytes };
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
    let settled = false;
    const fail = (err: unknown) => {
      if (settled) return;
      settled = true;
      clearInterval(heartbeat);
      reject(err instanceof Error ? err : new Error(String(err)));
    };
    const ok = () => {
      if (settled) return;
      settled = true;
      clearInterval(heartbeat);
      resolve();
    };

    const output = createWriteStream(zipPath);
    // store:true — media is already compressed; much faster / less CPU for multi-GB uploads
    const archive = new ZipArchive({ store: true, forceZip64: true });

    const totalEntries = (sqlPath ? 1 : 0) + uploadFiles.length + 1; // + manifest
    let entriesDone = 0;
    let lastEmitAt = 0;
    let lastPercent = basePercent;

    const emitWriteProgress = (force = false) => {
      const now = Date.now();
      if (!force && now - lastEmitAt < 750) return;
      lastEmitAt = now;
      const ratio = entriesDone / Math.max(totalEntries, 1);
      const percent = Math.min(
        endPercent,
        Math.round(basePercent + ratio * (endPercent - basePercent)),
      );
      lastPercent = percent;
      emit({
        type: "progress",
        stage: "zip",
        message: `Writing ZIP (${entriesDone}/${totalEntries} entries)…`,
        percent,
        current: entriesDone,
        total: totalEntries,
        jobId,
      });
    };

    // Keep the NDJSON stream alive so nginx/proxy idle timeouts don't kill the request
    const heartbeat = setInterval(() => {
      emit({
        type: "progress",
        stage: "zip",
        message: `Writing ZIP… still working (${entriesDone}/${totalEntries})`,
        percent: lastPercent,
        current: entriesDone,
        total: totalEntries,
        jobId,
      });
    }, 8000);

    output.on("close", () => ok());
    output.on("error", (err) => fail(err));
    archive.on("error", (err) => fail(err));
    archive.on("warning", (err) => {
      // Missing files etc. — log but continue unless fatal
      if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "ENOENT") {
        emit({
          type: "progress",
          stage: "zip",
          message: `Skipped missing file: ${(err as Error).message}`,
          percent: lastPercent,
          jobId,
        });
        return;
      }
      fail(err);
    });
    archive.on("entry", () => {
      entriesDone += 1;
      emitWriteProgress();
    });
    archive.pipe(output);

    emit({
      type: "progress",
      stage: "zip",
      message: "Queuing files into archive…",
      percent: basePercent,
      jobId,
    });

    if (sqlPath) {
      archive.file(sqlPath, { name: "database.sql" });
    }

    if (uploadsDir && uploadFiles.length) {
      for (const rel of uploadFiles) {
        const abs = path.join(uploadsDir, rel);
        archive.file(abs, {
          name: path.posix.join("uploads", rel.split(path.sep).join("/")),
        });
      }
    } else if (uploadsDir) {
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

    emit({
      type: "progress",
      stage: "zip",
      message: "Finalizing ZIP (writing file data — this can take several minutes)…",
      percent: Math.max(basePercent + 1, lastPercent),
      jobId,
    });

    void archive.finalize();
  });
}

export async function listBackupJobs(): Promise<BackupJobListItem[]> {
  const root = getJobsRoot();
  let dirs: import("node:fs").Dirent[] = [];
  try {
    dirs = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }

  const jobs: BackupJobListItem[] = [];
  for (const entry of dirs) {
    if (!entry.isDirectory() || !isValidJobId(entry.name)) continue;
    const dir = path.join(root, entry.name);
    try {
      const raw = await fs.readFile(path.join(dir, "meta.json"), "utf8");
      const meta = JSON.parse(raw) as Partial<BackupJobMeta>;
      if (!meta.filename || !meta.createdAt) continue;
      const zipPath = path.join(dir, meta.filename);
      const st = await fs.stat(zipPath).catch(() => null);
      if (!st?.isFile()) continue;
      jobs.push({
        jobId: entry.name,
        filename: meta.filename,
        createdAt: meta.createdAt,
        includeDatabase: Boolean(meta.includeDatabase),
        includeUploads: Boolean(meta.includeUploads),
        sizeBytes: typeof meta.sizeBytes === "number" ? meta.sizeBytes : st.size,
        downloadPath: `/api/v1/admin/backup/${entry.name}/download`,
      });
    } catch {
      // incomplete / corrupt job — skip from list
    }
  }

  jobs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return jobs;
}

export async function deleteBackupJob(jobId: string): Promise<boolean> {
  if (!isValidJobId(jobId)) return false;
  const dir = jobDir(jobId);
  try {
    await fs.access(dir);
  } catch {
    return false;
  }
  await fs.rm(dir, { recursive: true, force: true });
  return true;
}

export async function getBackupZipPath(jobId: string): Promise<{ zipPath: string; filename: string } | null> {
  if (!isValidJobId(jobId)) return null;
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
