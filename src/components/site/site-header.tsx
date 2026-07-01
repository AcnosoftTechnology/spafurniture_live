"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  url?: string | null;
  children?: NavItem[];
  megaPanel?: { columns?: { title: string; links: { label: string; url: string }[] }[] };
};

export function SiteHeader({ items, tagline }: { items: NavItem[]; tagline?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-stone-900">
          <span className="text-[#2d6a4f]">e</span>sthetica
          <span className="mt-0.5 block text-[9px] font-sans font-normal uppercase tracking-widest text-stone-500">
            Spa &amp; Salon Furniture
          </span>
        </Link>

        {tagline && (
          <p className="hidden text-[10px] uppercase tracking-[0.3em] text-stone-500 md:block">
            {tagline}
          </p>
        )}

        <nav className="hidden items-center gap-1 lg:flex">
          {items.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children?.length && setMegaOpen(item.label)}
              onMouseLeave={() => setMegaOpen(null)}
            >
              <Link
                href={item.url ?? "#"}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:text-stone-900"
              >
                {item.label}
                {item.children?.length ? <ChevronDown className="h-3.5 w-3.5" /> : null}
              </Link>
              <AnimatePresence>
                {megaOpen === item.label && item.children && item.children.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 top-full min-w-[280px] rounded-xl border border-stone-200 bg-white p-4 shadow-xl"
                  >
                    <div className="grid gap-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.url ?? "#"}
                          className="rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <Link
          href="/contact-us"
          className="hidden rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-stone-800 lg:inline-flex"
        >
          Get a Quote
        </Link>

        <button type="button" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-stone-200 lg:hidden"
          >
            <nav className="flex flex-col gap-1 p-4">
              {items.map((item) => (
                <Link
                  key={item.label}
                  href={item.url ?? "#"}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/contact-us" className="mt-2 rounded-full bg-stone-900 px-4 py-2 text-center text-sm text-white">
                Get a Quote
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
