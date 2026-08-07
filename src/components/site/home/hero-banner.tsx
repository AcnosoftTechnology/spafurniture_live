import { ParallaxSectionBg } from "@/components/site/home/parallax-section-bg";
import { mediaUrl } from "@/lib/utils";

type HeroImageFields = {
  imagePath: string;
  alt: string;
  mobileImagePath?: string | null;
};

export function HeroBanner({
  hero,
  sectionId = "home",
  caption,
  variant = "home",
}: {
  hero: HeroImageFields;
  sectionId?: string;
  caption?: string;
  variant?: "home" | "regional";
}) {
  const desktopSrc = mediaUrl(hero.imagePath);
  const mobilePath = hero.mobileImagePath?.trim() || "";
  const mobileSrc = mobilePath ? mediaUrl(mobilePath) : null;

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
            {/* Direct <picture> so regional GIFs + mobile art-direction both work (next/image breaks GIF / source switch). */}
            <picture className="esth-premium-picture">
              {mobileSrc ? (
                <source media="(max-width: 768px)" srcSet={mobileSrc} />
              ) : null}
              <img
                src={desktopSrc}
                alt={hero.alt}
                width={1400}
                height={1050}
                className="esth-premium-hero-img"
                decoding="async"
                fetchPriority="high"
              />
            </picture>
          </div>
          {caption ? <p className="esth-premium-caption">{caption}</p> : null}
        </div>
      </div>
    </section>
  );
}
