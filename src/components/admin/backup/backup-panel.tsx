"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Archive,
  CheckCircle2,
  Database,
  Download,
  FolderOpen,
  HardDrive,
  Loader2,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApiUrl } from "@/lib/utils";
import type { BackupProgressEvent } from "@/lib/backup-types";

type BackupEstimates = {
  webBackupEnabled: boolean;
  uploadsExists: boolean;
  uploadsDir: string;
  uploadsFiles: number;
  uploadsBytes: number;
  databaseConfigured: boolean;
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function BackupPanel() {
  const [info, setInfo] = useState<BackupEstimates | null>(null);
  const [loading, setLoading] = useState(true);
  const [includeDatabase, setIncludeDatabase] = useState(true);
  const [includeUploads, setIncludeUploads] = useState(true);
  const [running, setRunning] = useState(false);
  const [percent, setPercent] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [complete, setComplete] = useState<{
    jobId: string;
    filename: string;
    downloadPath: string;
    sizeBytes?: number;
  } | null>(null);

  const loadInfo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(adminApiUrl("/api/v1/admin/backup"));
      const json = (await res.json()) as { data?: BackupEstimates; error?: { message?: string } };
      if (!res.ok) {
        toast.error(json.error?.message ?? "Failed to load backup info");
        return;
      }
      setInfo(json.data ?? null);
    } catch {
      toast.error("Failed to load backup info");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInfo();
  }, [loadInfo]);

  function pushLog(message: string) {
    setLogs((prev) => [...prev.slice(-80), message]);
  }

  async function startBackup() {
    if (!includeDatabase && !includeUploads) {
      toast.error("Select Database and/or Files");
      return;
    }
    if (info && !info.webBackupEnabled) {
      toast.error("Web backups are disabled on this server.");
      return;
    }

    setRunning(true);
    setComplete(null);
    setPercent(0);
    setLogs([]);
    setCurrentFile(null);
    setStage("prepare");
    pushLog("Starting backup…");

    try {
      const res = await fetch(adminApiUrl("/api/v1/admin/backup/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeDatabase, includeUploads }),
      });

      if (!res.ok || !res.body) {
        let message = "Backup failed";
        try {
          const json = (await res.json()) as { error?: { message?: string } };
          if (json.error?.message) message = json.error.message;
        } catch {
          /* ignore */
        }
        toast.error(message);
        pushLog(message);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          let event: BackupProgressEvent;
          try {
            event = JSON.parse(trimmed) as BackupProgressEvent;
          } catch {
            continue;
          }

          if (event.percent != null) setPercent(event.percent);
          if (event.stage) setStage(event.stage);
          if (event.file) setCurrentFile(event.file);
          if (event.message) pushLog(event.message);

          if (event.type === "complete" && event.jobId && event.filename && event.downloadPath) {
            setComplete({
              jobId: event.jobId,
              filename: event.filename,
              downloadPath: event.downloadPath,
              sizeBytes: event.sizeBytes,
            });
            toast.success("Backup ready to download");
          }

          if (event.type === "error") {
            toast.error(event.message);
          }
        }
      }
    } catch {
      toast.error("Backup failed");
      pushLog("Backup failed");
    } finally {
      setRunning(false);
      setCurrentFile(null);
    }
  }

  function downloadBackup() {
    if (!complete) return;
    const href = adminApiUrl(complete.downloadPath);
    window.location.href = href.endsWith("/") ? href : `${href}/`;
  }

  const canRun =
    !running &&
    (includeDatabase || includeUploads) &&
    (info?.webBackupEnabled ?? true);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <HardDrive className="h-4 w-4" />
              Site backup
            </h2>
            <p className="max-w-xl text-xs text-stone-500">
              WordPress-style backup: choose database and/or uploaded files, watch progress, then
              download the ZIP when complete.
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => void loadInfo()} disabled={loading || running}>
            Refresh
          </Button>
        </div>

        {info && !info.webBackupEnabled ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Web backups are disabled (<code>DISABLE_WEB_BACKUPS=true</code>). Use SSH{" "}
            <code>scripts/db-backup.ps1</code> / rsync for uploads instead.
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
              includeDatabase ? "border-stone-900 bg-stone-50" : "border-stone-200"
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={includeDatabase}
              disabled={running}
              onChange={(e) => setIncludeDatabase(e.target.checked)}
            />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Database className="h-4 w-4" />
                Database
              </span>
              <span className="mt-1 block text-xs text-stone-500">
                Full PostgreSQL dump (<code>database.sql</code> inside the ZIP)
                {info?.databaseConfigured ? "" : " — DATABASE_URL missing"}
              </span>
            </span>
          </label>

          <label
            className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
              includeUploads ? "border-stone-900 bg-stone-50" : "border-stone-200"
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={includeUploads}
              disabled={running}
              onChange={(e) => setIncludeUploads(e.target.checked)}
            />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <FolderOpen className="h-4 w-4" />
                Files (uploads)
              </span>
              <span className="mt-1 block text-xs text-stone-500">
                {loading
                  ? "Scanning…"
                  : info?.uploadsExists
                    ? `${info.uploadsFiles.toLocaleString()} files · ${formatBytes(info.uploadsBytes)}`
                    : "Uploads folder not found"}
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={() => void startBackup()} disabled={!canRun}>
            {running ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-1.5 h-4 w-4" />
            )}
            {running ? "Creating backup…" : "Create backup"}
          </Button>
          {(includeDatabase || includeUploads) && (
            <span className="text-xs text-stone-500">
              Includes:{" "}
              {[includeDatabase ? "Database" : null, includeUploads ? "Uploads" : null]
                .filter(Boolean)
                .join(" + ")}
            </span>
          )}
        </div>
      </div>

      {(running || logs.length > 0 || complete) && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Archive className="h-4 w-4" />
              Progress
            </h3>
            {stage ? (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] uppercase tracking-wide text-stone-600">
                {stage}
              </span>
            ) : null}
          </div>

          <div className="mb-2 h-3 overflow-hidden rounded-full bg-stone-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                complete ? "bg-emerald-500" : "bg-stone-900"
              }`}
              style={{ width: `${Math.max(2, Math.min(100, percent))}%` }}
            />
          </div>
          <div className="mb-4 flex justify-between text-xs text-stone-500">
            <span>{currentFile ? `File: ${currentFile}` : running ? "Working…" : "Idle"}</span>
            <span className="font-medium text-stone-800">{percent}%</span>
          </div>

          <div className="max-h-48 overflow-y-auto rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-stone-600">
            {logs.length === 0 ? (
              <p className="text-stone-400">Waiting for events…</p>
            ) : (
              logs.map((line, i) => (
                <p key={`${i}-${line.slice(0, 24)}`} className="truncate">
                  {line}
                </p>
              ))
            )}
          </div>

          {complete ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-900">Backup complete</p>
                  <p className="text-xs text-emerald-800">
                    {complete.filename}
                    {complete.sizeBytes != null ? ` · ${formatBytes(complete.sizeBytes)}` : ""}
                  </p>
                </div>
              </div>
              <Button type="button" size="sm" onClick={downloadBackup}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download ZIP
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
