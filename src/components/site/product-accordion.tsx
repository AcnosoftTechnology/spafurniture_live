"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Section = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export function ProductAccordion({ sections }: { sections: Section[] }) {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);

  return (
    <div className="divide-y divide-stone-200 border-t border-stone-200">
      {sections.map((section) => {
        const open = openId === section.id;
        return (
          <div key={section.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : section.id)}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-800">
                {section.title}
              </span>
              {open ? (
                <Minus className="h-4 w-4 text-stone-500" />
              ) : (
                <Plus className="h-4 w-4 text-stone-500" />
              )}
            </button>
            <div
              className={cn(
                "overflow-hidden text-sm leading-relaxed text-stone-600 transition-all",
                open ? "max-h-[2000px] pb-6" : "max-h-0",
              )}
            >
              {section.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
