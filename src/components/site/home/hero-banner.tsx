import type { ReactNode } from "react";
import { ParallaxSectionBg } from "@/components/site/home/parallax-section-bg";
import { mediaUrl } from "@/lib/utils";

export type HeroImageFields = {
  imagePath: string;
  alt: string;
  mobileImagePath?: string | null;
  /** Banner watermark (PERFECTION). Empty/null hides; undefined keeps legacy default. */
  bgImagePath?: string | null;
};

const LEGACY_BANNER_BG = "/assets/images/bg/perfection.png";

function resolveBannerBgUrl(bgImagePath: string | null | undefined): string | null {
  if (bgImagePath === "" || bgImagePath === null) return null;
  if (bgImagePath === undefined) return mediaUrl(LEGACY_BANNER_BG);
  const trimmed = bgImagePath.trim();
  return trimmed ? mediaUrl(trimmed) : null;
}

function resolveHeroPaths(hero: HeroImageFields) {
  let imagePath = hero.imagePath;
  let mobileImagePath = hero.mobileImagePath?.trim() || "";

  // Auto-upgrade bundled legacy PNG to optimized WebP pair (design unchanged).
  if (
    imagePath === "/assets/images/bg/spa-main.png" ||
    imagePath === "/assets/images/bg/spa-main-original.png"
  ) {
    imagePath = "/assets/images/bg/spa-main.webp";
    if (!mobileImagePath) mobileImagePath = "/assets/images/bg/spa-main-mobile.webp";
  }

  return { imagePath, mobileImagePath };
}

/** Hoist into <head> from the homepage (and regional pages) for faster mobile LCP. */
export function HeroLcpPreloads({ hero }: { hero: HeroImageFields }) {
  const resolved = resolveHeroPaths(hero);
  const desktopSrc = mediaUrl(resolved.imagePath);
  const mobileSrc = resolved.mobileImagePath
    ? mediaUrl(resolved.mobileImagePath)
    : desktopSrc;

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={mobileSrc}
        media="(max-width: 768px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={desktopSrc}
        media="(min-width: 769px)"
        fetchPriority="high"
      />
    </>
  );
}

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
  const resolved = resolveHeroPaths(hero);
  const desktopSrc = mediaUrl(resolved.imagePath);
  const mobileSrc = resolved.mobileImagePath ? mediaUrl(resolved.mobileImagePath) : null;

  // Direct public URLs (e.g. /uploads/...) — no /_next/image optimizer for the hero.
  const pictureInner: ReactNode = (
    <>
      {mobileSrc ? <source media="(max-width: 768px)" srcSet={mobileSrc} /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- hero uses live media paths */}
      <img
        src={desktopSrc}
        alt={hero.alt}
        width={1400}
        height={1050}
        className="esth-premium-hero-img"
        fetchPriority="high"
        decoding="async"
      />
    </>
  );

  const bannerBgUrl = resolveBannerBgUrl(hero.bgImagePath);

  return (
    <section
      className={`esth-premium-banner${variant === "regional" ? " esth-premium-banner--regional" : ""}`}
      id={sectionId}
    >
      {/* Always keep this layer for layout; only the image paint is optional. */}
      <ParallaxSectionBg
        className="esth-premium-banner-bg"
        imageUrl={bannerBgUrl}
        maxShift={variant === "regional" ? 0 : 165}
        strength={variant === "regional" ? 0 : undefined}
        parallaxScale={1}
      />
      <div className=" esth-premium-banner-shell">
        <div className="esth-premium-banner-inner">
          <div className="esth-premium-image">
            <picture className="esth-premium-picture">{pictureInner}</picture>
          </div>
          {caption ? <p className="esth-premium-caption">{caption}</p> : null}
        </div>
      </div>
    </section>
  );
}
