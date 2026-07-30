"use client";

import { useState } from "react";
import { EsthContainer } from "@/components/site/layout/esth-container";
import { ScrollRevealFadeInUp } from "@/components/site/motion/scroll-reveal-fade-in-up";
import { prepareRegionalIntroHtml } from "@/lib/regional-intro-html";
import type { RegionalPageContent } from "@/features/regional-pages/schemas/regional-content.schema";

function hasIntroContent(html: string): boolean {
  const text = html
    .replace(/\[\/?grid[^\]]*\]/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#\d+;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
}

function initialLanguage(hasArabic: boolean, hasEnglish: boolean): "ar" | "en" {
  if (hasArabic) return "ar";
  return "en";
}

export function RegionalIntroSection({ data }: { data: RegionalPageContent["intro"] }) {
  const hasArabic = hasIntroContent(data.arabicHtml);
  const hasEnglish = hasIntroContent(data.englishHtml);
  const showToggle = hasArabic && hasEnglish;

  const [language, setLanguage] = useState<"ar" | "en">(() =>
    initialLanguage(hasArabic, hasEnglish),
  );

  if (!hasArabic && !hasEnglish) return null;

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
          {showToggle ? (
            <ScrollRevealFadeInUp delay={0.5} className="esth-regional-lang-btn-wrap">
              <button
                type="button"
                className="esth-regional-lang-btn"
                onClick={() => setLanguage((current) => (current === "ar" ? "en" : "ar"))}
              >
                {language === "ar" ? data.englishButtonLabel : data.arabicButtonLabel}
              </button>
            </ScrollRevealFadeInUp>
          ) : null}
        </div>
      </EsthContainer>
    </section>
  );
}
