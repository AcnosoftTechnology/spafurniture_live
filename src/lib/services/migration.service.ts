import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";

export type MigrationItemStatus = "applied" | "pending" | "failed";

export type MigrationItem = {
  name: string;
  status: MigrationItemStatus;
  finishedAt: string | null;
  appliedStepsCount: number | null;
};

export type MigrationStatusReport = {
  pendingCount: number;
  appliedCount: number;
  failedCount: number;
  migrations: MigrationItem[];
  databaseConnected: boolean;
  webMigrateEnabled: boolean;
  prismaCliAvailable: boolean;
  checkedAt: string;
};

export type MigrationDeployReport = {
  success: boolean;
  message: string;
  stdout: string;
  stderr: string;
  status: MigrationStatusReport;
};

type AppliedMigrationRow = {
  migration_name: string;
  finished_at: Date | null;
  rolled_back_at: Date | null;
  applied_steps_count: number | null;
};

const MIGRATIONS_DIR = path.join(process.cwd(), "prisma", "migrations");

function prismaBinaryPath() {
  const bin = process.platform === "win32" ? "prisma.cmd" : "prisma";
  return path.join(process.cwd(), "node_modules", ".bin", bin);
}

export function isWebMigrateEnabled() {
  return process.env.DISABLE_WEB_MIGRATIONS !== "true";
}

async function listLocalMigrationNames(): Promise<string[]> {
  const entries = await fs.readdir(MIGRATIONS_DIR, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function readAppliedMigrations(): Promise<AppliedMigrationRow[]> {
  try {
    return await prisma.$queryRaw<AppliedMigrationRow[]>`
      SELECT migration_name, finished_at, rolled_back_at, applied_steps_count
      FROM "_prisma_migrations"
      ORDER BY finished_at ASC NULLS LAST
    `;
  } catch {
    return [];
  }
}

async function prismaCliExists() {
  try {
    await fs.access(prismaBinaryPath());
    return true;
  } catch {
    return false;
  }
}

function runPrismaCommand(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(prismaBinaryPath(), args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ stdout, stderr, code: code ?? 1 });
    });
  });
}

export async function getMigrationStatus(): Promise<MigrationStatusReport> {
  const [localNames, appliedRows, databaseConnected, prismaCliAvailable] = await Promise.all([
    listLocalMigrationNames(),
    readAppliedMigrations(),
    prisma
      .$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false),
    prismaCliExists(),
  ]);

  const appliedByName = new Map(appliedRows.map((row) => [row.migration_name, row]));

  const migrations: MigrationItem[] = localNames.map((name) => {
    const row = appliedByName.get(name);
    if (!row) {
      return { name, status: "pending", finishedAt: null, appliedStepsCount: null };
    }
    if (row.rolled_back_at || !row.finished_at) {
      return {
        name,
        status: "failed",
        finishedAt: row.finished_at?.toISOString() ?? null,
        appliedStepsCount: row.applied_steps_count,
      };
    }
    return {
      name,
      status: "applied",
      finishedAt: row.finished_at.toISOString(),
      appliedStepsCount: row.applied_steps_count,
    };
  });

  const pendingCount = migrations.filter((item) => item.status === "pending").length;
  const failedCount = migrations.filter((item) => item.status === "failed").length;
  const appliedCount = migrations.filter((item) => item.status === "applied").length;

  return {
    pendingCount,
    appliedCount,
    failedCount,
    migrations,
    databaseConnected,
    webMigrateEnabled: isWebMigrateEnabled(),
    prismaCliAvailable,
    checkedAt: new Date().toISOString(),
  };
}

export async function deployPendingMigrations(): Promise<MigrationDeployReport> {
  if (!isWebMigrateEnabled()) {
    const status = await getMigrationStatus();
    return {
      success: false,
      message: "Web migrations are disabled on this server (DISABLE_WEB_MIGRATIONS=true).",
      stdout: "",
      stderr: "",
      status,
    };
  }

  const before = await getMigrationStatus();
  if (!before.databaseConnected) {
    return {
      success: false,
      message: "Database connection failed. Check DATABASE_URL.",
      stdout: "",
      stderr: "",
      status: before,
    };
  }

  if (!before.prismaCliAvailable) {
    return {
      success: false,
      message: "Prisma CLI not found. Run npm install on the server.",
      stdout: "",
      stderr: "",
      status: before,
    };
  }

  if (before.pendingCount === 0 && before.failedCount === 0) {
    return {
      success: true,
      message: "Database is already up to date.",
      stdout: "",
      stderr: "",
      status: before,
    };
  }

  const deploy = await runPrismaCommand(["migrate", "deploy"]);
  const generate = deploy.code === 0 ? await runPrismaCommand(["generate"]) : null;

  const stdout = [deploy.stdout, generate?.stdout].filter(Boolean).join("\n").trim();
  const stderr = [deploy.stderr, generate?.stderr].filter(Boolean).join("\n").trim();
  const status = await getMigrationStatus();

  const success = deploy.code === 0 && (generate?.code ?? 0) === 0 && status.pendingCount === 0;

  let message = success
    ? `Applied ${before.pendingCount} pending migration(s). Database is up to date.`
    : "Migration deploy failed. See output below.";

  if (deploy.code === 0 && status.pendingCount > 0) {
    message = "Deploy finished but some migrations are still pending. Check server logs.";
  }

  return {
    success,
    message,
    stdout,
    stderr,
    status,
  };
}
