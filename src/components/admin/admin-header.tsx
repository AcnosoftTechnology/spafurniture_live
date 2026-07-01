"use client";

import { signOut, useSession } from "next-auth/react";
import { Moon, Sun, LogOut, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminHeader({ title }: { title: string }) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-14 items-center justify-between border-b border-stone-200 bg-white/80 px-6 backdrop-blur dark:border-stone-800 dark:bg-stone-950/80">
      <h1 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{title}</h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" strokeWidth={1.75} />
          <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" strokeWidth={1.75} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              {session?.user?.name ?? "Admin"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-xs text-stone-500">{session?.user?.email}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/admin/login" })} className="text-xs">
              <LogOut className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
