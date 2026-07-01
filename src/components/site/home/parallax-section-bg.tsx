"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "@/components/site/smooth-scroll-provider";

type ParallaxSectionBgProps = {
  className?: string;
  imageUrl: string;
  /** How far the bg may shift in px (default 120). */
  maxShift?: number;
  /** Extra motion multiplier (default 1.35). */
  strength?: number;
  /** Parallax zoom scale (default 1.14). Use 1 when bg must not clip. */
  parallaxScale?: number;
  /** Hide this many px at the top initially; reveals as the user scrolls down. */
  revealOffset?: number;
  /** Scroll distance (px) over which the reveal completes (default 180). */
  revealDistance?: number;
  /** Extra downward shift (px) when section scrolls out at top. Defaults to ~55% of revealOffset. */
  revealEndShift?: number;
};

export function ParallaxSectionBg({
  className,
  imageUrl,
  maxShift = 200,
  strength = 1.75,
  parallaxScale = 1.14,
  revealOffset = 0,
  revealDistance = 180,
  revealEndShift,
}: ParallaxSectionBgProps) {
  const bgRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const configRef = useRef({
    maxShift,
    strength,
    parallaxScale,
    revealOffset,
    revealDistance,
    revealEndShift,
  });
  configRef.current = {
    maxShift,
    strength,
    parallaxScale,
    revealOffset,
    revealDistance,
    revealEndShift,
  };

  const inViewRef = useRef(false);
  const rafIdRef = useRef(0);
  const scheduleUpdateRef = useRef<() => void>(() => {});

  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;

    const section = bg.parentElement;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      bg.style.transform = "none";
      return;
    }

    const update = () => {
      rafIdRef.current = 0;
      if (!inViewRef.current) return;

      const {
        maxShift: shiftMax,
        strength: shiftStrength,
        parallaxScale: scaleSetting,
        revealOffset: revealStart,
        revealDistance: revealSpan,
        revealEndShift: revealEnd,
      } = configRef.current;

      const mobile = window.innerWidth <= 768;
      const scale = mobile ? 1 : scaleSetting;
      const effectiveRevealOffset = revealStart;
      const vh = window.innerHeight;
      const rect = section.getBoundingClientRect();

      if (rect.bottom < 0 || rect.top > vh) {
        const endShift = revealEnd ?? effectiveRevealOffset * 0.55;
        bg.style.transform =
          effectiveRevealOffset > 0
            ? rect.bottom < 0
              ? `translate3d(0, ${endShift}px, 0) scale(${scale})`
              : `translate3d(0, ${-effectiveRevealOffset}px, 0) scale(${scale})`
            : `translate3d(0, 0, 0) scale(${scale})`;
        return;
      }

      const scrollY = lenisRef.current?.scroll ?? window.scrollY;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      const start = sectionTop - vh;
      const end = sectionTop + sectionHeight;
      const range = Math.max(end - start, 1);
      const progress = Math.max(0, Math.min(1, (scrollY - start) / range));

      const shiftMultiplier = mobile ? 0.35 : 1;

      if (effectiveRevealOffset > 0) {
        const endShift = revealEnd ?? effectiveRevealOffset * 0.55;
        const travelStart = vh;
        const travelEnd = -Math.max(revealSpan, sectionHeight * 0.45);
        const travelRange = Math.max(travelStart - travelEnd, 1);
        const t = Math.max(0, Math.min(1, (travelStart - rect.top) / travelRange));
        const eased = t * t * (3 - 2 * t);
        const shift = -effectiveRevealOffset + eased * (endShift + effectiveRevealOffset);

        bg.style.transform = `translate3d(0, ${shift}px, 0) scale(${scale})`;
        return;
      }

      const shift = (0.5 - progress) * shiftMax * shiftStrength * shiftMultiplier;

      bg.style.transform = `translate3d(0, ${shift}px, 0) scale(${scale})`;
    };

    const scheduleUpdate = () => {
      if (rafIdRef.current) return;
      rafIdRef.current = window.requestAnimationFrame(update);
    };

    scheduleUpdateRef.current = scheduleUpdate;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (inViewRef.current) scheduleUpdate();
      },
      { rootMargin: "15% 0px" },
    );
    observer.observe(section);

    const onScroll = () => {
      if (inViewRef.current) scheduleUpdate();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    scheduleUpdate();

    return () => {
      observer.disconnect();
      if (rafIdRef.current) window.cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [maxShift, strength, parallaxScale, revealOffset, revealDistance, revealEndShift]);

  useEffect(() => {
    if (!lenis) return;

    const onScroll = () => scheduleUpdateRef.current();
    lenis.on("scroll", onScroll);
    scheduleUpdateRef.current();

    return () => {
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  return (
    <div
      ref={bgRef}
      className={className}
      aria-hidden
      style={{ backgroundImage: `url("${imageUrl}")` }}
    />
  );
}
