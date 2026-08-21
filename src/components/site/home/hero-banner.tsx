import { getImageProps } from "next/image";
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

function isAnimatedGif(path: string) {
  return /\.gif(\?|#|$)/i.test(path);
}

function buildOptimizedPicture(opts: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return getImageProps({
    src: opts.src,
    alt: opts.alt,
    width: opts.width,
    height: opts.height,
    sizes: "100vw",
    priority: true,
    quality: 78,
  }).props;
}

/** Hoist into <head> from the homepage (and regional pages) for faster mobile LCP. */
export function HeroLcpPreloads({ hero }: { hero: HeroImageFields }) {
  const resolved = resolveHeroPaths(hero);
  const desktopSrc = mediaUrl(resolved.imagePath);
  const mobileSrc = resolved.mobileImagePath
    ? mediaUrl(resolved.mobileImagePath)
    : desktopSrc;

  if (isAnimatedGif(desktopSrc) || isAnimatedGif(mobileSrc)) {
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

  const desktop = buildOptimizedPicture({
    src: desktopSrc,
    alt: hero.alt,
    width: 1400,
    height: 1050,
  });
  const mobile = buildOptimizedPicture({
    src: mobileSrc,
    alt: hero.alt,
    width: 900,
    height: 1200,
  });

  return (
    <>
      <link
        rel="preload"
        as="image"
        imageSrcSet={mobile.srcSet}
        imageSizes={mobile.sizes}
        media="(max-width: 768px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        imageSrcSet={desktop.srcSet}
        imageSizes={desktop.sizes}
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
  const mobilePath = resolved.mobileImagePath;
  const mobileSrc = mobilePath ? mediaUrl(mobilePath) : null;
  const gifSafe = isAnimatedGif(desktopSrc) || (mobileSrc ? isAnimatedGif(mobileSrc) : false);

  let pictureInner: ReactNode;

  if (gifSafe) {
    pictureInner = (
      <>
        {mobileSrc ? <source media="(max-width: 768px)" srcSet={mobileSrc} /> : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- GIF art-direction */}
        <img
          src={desktopSrc}
          alt={hero.alt}
          width={1400}
          height={1050}
          className="esth-premium-hero-img"
          fetchPriority="high"
        />
      </>
    );
  } else {
    const desktop = buildOptimizedPicture({
      src: desktopSrc,
      alt: hero.alt,
      width: 1400,
      height: 1050,
    });
    const mobile = mobileSrc
      ? buildOptimizedPicture({
          src: mobileSrc,
          alt: hero.alt,
          width: 900,
          height: 1200,
        })
      : null;
    const { srcSet: desktopSrcSet, ...imgProps } = desktop;
    pictureInner = (
      <>
        {mobile?.srcSet ? (
          <source media="(max-width: 768px)" srcSet={mobile.srcSet} sizes={mobile.sizes} />
        ) : null}
        <source media="(min-width: 769px)" srcSet={desktopSrcSet} sizes={desktop.sizes} />
        {/* eslint-disable-next-line @next/next/no-img-element -- picture + getImageProps */}
        <img {...imgProps} className="esth-premium-hero-img" alt={hero.alt} />
      </>
    );
  }

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
