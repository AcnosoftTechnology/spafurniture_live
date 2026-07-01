"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Database } from "lucide-react";
import { adminApiUrl } from "@/lib/utils";
import type { MigrationStatusReport } from "@/lib/services/migration.service";

export function MigrationStatusBanner() {
  const [status, setStatus] = useState<MigrationStatusReport | null>(null);

  useEffect(() => {
    let active = true;
    fetch(adminApiUrl("/api/v1/admin/migrations"))
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.data) setStatus(json.data as MigrationStatusReport);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!status || (status.pendingCount === 0 && status.failedCount === 0)) return null;

  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-medium">
            {status.pendingCount > 0
              ? `${status.pendingCount} database migration(s) pending`
              : `${status.failedCount} migration(s) need attention`}
          </p>
          <p className="mt-1 text-sm text-amber-900/80">
            New code was uploaded but the live database is not fully updated yet. Apply migrations
            from the Database page.
          </p>
        </div>
      </div>
      <Link
        href="/admin/migrations/"
        className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800"
      >
        <Database className="h-4 w-4" />
        Open Database
      </Link>
    </div>
  );
}
