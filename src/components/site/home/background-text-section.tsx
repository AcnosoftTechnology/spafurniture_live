import { ParallaxSectionBg } from "@/components/site/home/parallax-section-bg";
import { SectionButton } from "@/components/site/home/section-button";
import { EsthContainer } from "@/components/site/layout/esth-container";
import { ScrollRevealFadeInUp } from "@/components/site/motion/scroll-reveal-fade-in-up";
import type { HomepageContent } from "@/features/homepage/schemas/homepage-content.schema";

export function BackgroundTextSection({ data }: { data: HomepageContent["backgroundText"] }) {
  return (
    <section className="esth-bgtext-section" id="about">
      <ParallaxSectionBg
        className="esth-bgtext-image"
        imageUrl="/assets/images/bg/bg-icon.png"
        maxShift={180}
      />
      <EsthContainer>
        <div className="esth-bgtext-content">
          <ScrollRevealFadeInUp delay={0.4}>
            <p>{data.text}</p>
          </ScrollRevealFadeInUp>
          <ScrollRevealFadeInUp delay={0.55} className="esth-bgtext-cta-wrap">
            <SectionButton label={data.ctaLabel} href={data.ctaHref} />
          </ScrollRevealFadeInUp>
        </div>
      </EsthContainer>
    </section>
  );
}
