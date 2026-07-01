"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Database, RefreshCw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApiUrl } from "@/lib/utils";
import type { MigrationDeployReport, MigrationStatusReport } from "@/lib/services/migration.service";

function statusBadge(status: MigrationStatusReport["migrations"][number]["status"]) {
  if (status === "applied") return <Badge variant="success">Applied</Badge>;
  if (status === "pending") return <Badge variant="warning">Pending</Badge>;
  return <Badge variant="destructive">Failed</Badge>;
}

export function MigrationsPanel() {
  const [status, setStatus] = useState<MigrationStatusReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [lastDeploy, setLastDeploy] = useState<MigrationDeployReport | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(adminApiUrl("/api/v1/admin/migrations"));
      const json = (await res.json()) as { data?: MigrationStatusReport; error?: { message?: string } };
      if (!res.ok) {
        toast.error(json.error?.message ?? "Failed to load migration status");
        return;
      }
      setStatus(json.data ?? null);
    } catch {
      toast.error("Failed to load migration status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function deployMigrations() {
    if (!status?.webMigrateEnabled) {
      toast.error("Web migrations are disabled on this server.");
      return;
    }
    if (status.pendingCount === 0 && status.failedCount === 0) {
      toast.message("Database is already up to date.");
      return;
    }

    setDeploying(true);
    try {
      const res = await fetch(adminApiUrl("/api/v1/admin/migrations/deploy"), { method: "POST" });
      const json = (await res.json()) as { data?: MigrationDeployReport; error?: { message?: string } };
      if (!res.ok) {
        toast.error(json.error?.message ?? "Migration deploy failed");
        return;
      }
      const result = json.data;
      if (!result) return;
      setLastDeploy(result);
      setStatus(result.status);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    } catch {
      toast.error("Migration deploy failed");
    } finally {
      setDeploying(false);
    }
  }

  const needsAction = (status?.pendingCount ?? 0) > 0 || (status?.failedCount ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-stone-100 p-2">
            <Database className="h-5 w-5 text-stone-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Database migrations</h2>
            <p className="mt-1 max-w-2xl text-sm text-stone-500">
              After uploading new code to the live server, open this page. If pending migrations are
              detected, click <strong>Apply pending migrations</strong> once.
            </p>
            {status?.checkedAt ? (
              <p className="mt-2 text-xs text-stone-400">
                Last checked {formatDistanceToNow(new Date(status.checkedAt), { addSuffix: true })}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={loadStatus} disabled={loading || deploying}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            type="button"
            onClick={deployMigrations}
            disabled={loading || deploying || !status?.webMigrateEnabled || !needsAction}
          >
            <Play className="mr-2 h-4 w-4" />
            {deploying ? "Applying..." : "Apply pending migrations"}
          </Button>
        </div>
      </div>

      {status && !status.databaseConnected ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Database connection failed. Check <code>DATABASE_URL</code> in the server environment.
        </div>
      ) : null}

      {status && !status.prismaCliAvailable ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Prisma CLI not found. Run <code>npm install</code> on the server after uploading files.
        </div>
      ) : null}

      {status && !status.webMigrateEnabled ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Web migrations are disabled (<code>DISABLE_WEB_MIGRATIONS=true</code>). Use SSH:{" "}
          <code>npm run db:migrate:deploy</code>
        </div>
      ) : null}

      {status && needsAction ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>{status.pendingCount}</strong> pending and <strong>{status.failedCount}</strong>{" "}
          failed migration(s) detected. Apply them before using features that depend on new database
          columns.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-stone-200 bg-stone-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
          <span>Migration</span>
          <span>Status</span>
          <span>Applied</span>
        </div>
        {loading && !status ? (
          <p className="px-4 py-8 text-sm text-stone-500">Loading migration status...</p>
        ) : status?.migrations.length ? (
          status.migrations.map((migration) => (
            <div
              key={migration.name}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-stone-100 px-4 py-3 last:border-b-0"
            >
              <code className="text-sm text-stone-800">{migration.name}</code>
              {statusBadge(migration.status)}
              <span className="text-xs text-stone-500">
                {migration.finishedAt
                  ? formatDistanceToNow(new Date(migration.finishedAt), { addSuffix: true })
                  : "—"}
              </span>
            </div>
          ))
        ) : (
          <p className="px-4 py-8 text-sm text-stone-500">No migration files found in prisma/migrations.</p>
        )}
      </div>

      {lastDeploy && (lastDeploy.stdout || lastDeploy.stderr) ? (
        <div className="rounded-xl border border-stone-200 bg-stone-950 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Deploy output</p>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs text-stone-100">
            {[lastDeploy.stdout, lastDeploy.stderr].filter(Boolean).join("\n")}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
