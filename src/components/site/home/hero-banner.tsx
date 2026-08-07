import { getImageProps } from "next/image";
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

  const desktop = getImageProps({
    alt: hero.alt,
    sizes: "100vw",
    priority: true,
    width: 1400,
    height: 1050,
    src: desktopSrc,
  }).props;

  const mobile = mobileSrc
    ? getImageProps({
        alt: hero.alt,
        sizes: "100vw",
        priority: true,
        width: 900,
        height: 1200,
        src: mobileSrc,
      }).props
    : null;

  const { srcSet: desktopSrcSet, ...imgProps } = desktop;

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
            <picture>
              {mobile?.srcSet ? (
                <source media="(max-width: 768px)" srcSet={mobile.srcSet} sizes={mobile.sizes} />
              ) : null}
              <source media="(min-width: 769px)" srcSet={desktopSrcSet} sizes={desktop.sizes} />
              {/* eslint-disable-next-line @next/next/no-img-element -- picture + getImageProps for mobile art-direction */}
              <img {...imgProps} className="esth-premium-hero-img" alt={hero.alt} />
            </picture>
          </div>
          {caption ? <p className="esth-premium-caption">{caption}</p> : null}
        </div>
      </div>
    </section>
  );
}
