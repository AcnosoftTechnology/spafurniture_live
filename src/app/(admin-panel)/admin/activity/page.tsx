import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  let logs: Array<{
    id: string;
    action: string;
    entityType: string | null;
    createdAt: Date;
    actor: { name: string } | null;
  }> = [];
  try {
    logs = await prisma.activityLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true, email: true } } },
    });
  } catch {
    // empty
  }

  return (
    <>
      <AdminHeader title="Activity Log" />
      <main className="flex-1 overflow-y-auto p-6">
        <ul className="space-y-3">
          {logs.map((log) => (
            <li key={log.id} className="rounded-lg border border-stone-200 px-4 py-3 text-xs dark:border-stone-800">
              <span className="font-medium">{log.actor?.name ?? "System"}</span>{" "}
              <span className="text-stone-600">{log.action}</span>
              {log.entityType && <span className="text-stone-400"> · {log.entityType}</span>}
              <span className="block text-[10px] text-stone-400">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </span>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
