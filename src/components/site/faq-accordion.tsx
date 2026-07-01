"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqAccordionItem = {
  id: string;
  question: string;
  answer: string;
};

export function FaqAccordion({ items, className }: { items: FaqAccordionItem[]; className?: string }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  if (!items.length) return null;

  return (
    <div className={cn("esth-faq-accordion", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className={cn("esth-faq-accordion-item", isOpen && "is-open")}>
            <button
              type="button"
              className="esth-faq-accordion-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              <span dangerouslySetInnerHTML={{ __html: item.question }} />
              <ChevronDown className={cn("esth-faq-accordion-icon", isOpen && "is-open")} aria-hidden />
            </button>
            {isOpen ? (
              <div
                className="esth-faq-accordion-panel"
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
