import { ParallaxSectionBg } from "@/components/site/home/parallax-section-bg";
import { mediaUrl } from "@/lib/utils";
import type { HomepageContent } from "@/features/homepage/schemas/homepage-content.schema";

export function HeroBanner({
  hero,
  sectionId = "home",
  caption,
  variant = "home",
}: {
  hero: HomepageContent["hero"];
  sectionId?: string;
  caption?: string;
  variant?: "home" | "regional";
}) {
  return (
    <section
      className={`esth-premium-banner${variant === "regional" ? " esth-premium-banner--regional" : ""}`}
      id={sectionId}
    >
      <ParallaxSectionBg
        className="esth-premium-banner-bg"
        imageUrl="/assets/images/bg/perfection.png"
        maxShift={variant === "regional" ? 0 : 165}
        strength={variant === "regional" ? 0 : undefined}
        parallaxScale={1}
      />
      <div className=" esth-premium-banner-shell">
        <div className="esth-premium-banner-inner">
          <div className="esth-premium-image">
            <img src={mediaUrl(hero.imagePath)} alt={hero.alt} />
          </div>
          {caption ? <p className="esth-premium-caption">{caption}</p> : null}
        </div>
      </div>
    </section>
  );
}
