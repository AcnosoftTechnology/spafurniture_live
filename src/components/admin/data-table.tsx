"use client";

import { cn } from "@/lib/utils";

export function DataTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900", className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function DataTableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-stone-200 bg-stone-50 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:bg-stone-950">
        {children}
      </tr>
    </thead>
  );
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-stone-100 text-xs dark:divide-stone-800">{children}</tbody>;
}

export function DataTableRow({ children }: { children: React.ReactNode }) {
  return <tr className="transition-colors hover:bg-stone-50 dark:hover:bg-stone-900/50">{children}</tr>;
}

export function DataTableCell({
  children,
  className,
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={cn("px-4 py-3 text-stone-700 dark:text-stone-300", className)}>
      {children}
    </td>
  );
}
