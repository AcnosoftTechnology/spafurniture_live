"use client";

import { useState } from "react";
import { EsthContainer } from "@/components/site/layout/esth-container";
import { ScrollRevealFadeInUp } from "@/components/site/motion/scroll-reveal-fade-in-up";
import { prepareRegionalIntroHtml } from "@/lib/regional-intro-html";
import type { RegionalPageContent } from "@/features/regional-pages/schemas/regional-content.schema";

export function RegionalIntroSection({ data }: { data: RegionalPageContent["intro"] }) {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const html = language === "ar" ? data.arabicHtml : data.englishHtml;

  return (
    <section className="esth-regional-intro-section" id="regional-intro">
      <EsthContainer>
        <div
          className={`esth-regional-intro-content ${language === "ar" ? "is-arabic" : "is-english"}`}
        >
          <ScrollRevealFadeInUp delay={0.35}>
            <div
              className="esth-regional-intro-copy"
              dangerouslySetInnerHTML={{ __html: prepareRegionalIntroHtml(html) }}
            />
          </ScrollRevealFadeInUp>
          <ScrollRevealFadeInUp delay={0.5} className="esth-regional-lang-btn-wrap">
            <button
              type="button"
              className="esth-regional-lang-btn"
              onClick={() => setLanguage((current) => (current === "ar" ? "en" : "ar"))}
            >
              {language === "ar" ? data.englishButtonLabel : data.arabicButtonLabel}
            </button>
          </ScrollRevealFadeInUp>
        </div>
      </EsthContainer>
    </section>
  );
}
