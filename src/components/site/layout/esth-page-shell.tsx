import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EsthPageShellProps = {
  children: ReactNode;
  className?: string;
};

/** Shared content width — matches products/category pages (max 1320px, 48px side inset). */
export function EsthPageShell({ children, className }: EsthPageShellProps) {
  return <div className={cn("esth-page-shell", className)}>{children}</div>;
}
