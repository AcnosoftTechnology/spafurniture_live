"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { EsthContainer } from "@/components/site/layout/esth-container";
import { ScrollRevealItem, ScrollRevealStagger } from "@/components/site/motion/scroll-reveal";
import type { HomepageFaq } from "@/features/homepage/get-homepage-data";

export function FaqSection({ items }: { items: HomepageFaq[] }) {
 const [openId, setOpenId] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="esth-bs-faq-section">
      <EsthContainer>
        <ScrollRevealStagger>
          <ScrollRevealItem className="esth-bs-faq-title">
            <h2>FAQ</h2>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <div className="esth-bs-accordion" id="esthFaqAccordion">
              {items.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div className="esth-bs-faq-item" key={item.id}>
                    <h2>
                      <button
                        type="button"
                        className={`esth-bs-faq-btn flex w-full items-center gap-4 text-left ${isOpen ? "" : "collapsed"}`}
                        aria-expanded={isOpen}
                        onClick={() => setOpenId(isOpen ? null : item.id)}
                      >
                        {isOpen ? (
                          <Minus className="esth-bs-faq-icon" strokeWidth={3} aria-hidden />
                        ) : (
                          <Plus className="esth-bs-faq-icon" strokeWidth={3} aria-hidden />
                        )}
                        {item.question}
                      </button>
                    </h2>
                    {isOpen ? <div className="esth-bs-faq-body">{item.answer}</div> : null}
                  </div>
                );
              })}
            </div>
          </ScrollRevealItem>
        </ScrollRevealStagger>
      </EsthContainer>
    </section>
  );
}
