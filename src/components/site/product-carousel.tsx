"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShimmerSkeleton } from "@/components/ui/skeleton";
import { mediaUrl, cn } from "@/lib/utils";

type Slide = { id: string; path: string; alt: string };

const SLIDE_MS = 400;
const AUTOPLAY_MS = 3000;

type ProductCarouselProps = {
  slides: Slide[];
  onReady?: () => void;
};

export function ProductCarousel({ slides, onReady }: ProductCarouselProps) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loadedIds, setLoadedIds] = useState<Record<string, boolean>>({});
  const readyNotified = useRef(false);

  const notifyReady = useCallback(() => {
    if (readyNotified.current) return;
    readyNotified.current = true;
    onReady?.();
  }, [onReady]);

  const markLoaded = useCallback(
    (id: string) => {
      setLoadedIds((prev) => {
        if (prev[id]) return prev;
        return { ...prev, [id]: true };
      });
      notifyReady();
    },
    [notifyReady],
  );

  const goTo = useCallback(
    (next: number, dir: "next" | "prev") => {
      if (!slides.length || isAnimating || next === index) return;
      setDirection(dir);
      setPrevIndex(index);
      setIsAnimating(true);
      setIndex(next);
      window.setTimeout(() => {
        setPrevIndex(null);
        setIsAnimating(false);
      }, SLIDE_MS);
    },
    [index, isAnimating, slides.length],
  );

  const goNext = useCallback(() => {
    goTo((index + 1) % slides.length, "next");
  }, [goTo, index, slides.length]);

  const goPrev = useCallback(() => {
    goTo(index === 0 ? slides.length - 1 : index - 1, "prev");
  }, [goTo, index, slides.length]);

  useEffect(() => {
    if (!slides.length) {
      notifyReady();
      return;
    }
    const first = slides[0];
    if (loadedIds[first.id]) notifyReady();
  }, [slides, loadedIds, notifyReady]);

  useEffect(() => {
    if (!slides.length) return;
    const fallback = window.setTimeout(notifyReady, 1800);
    return () => window.clearTimeout(fallback);
  }, [slides.length, notifyReady]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused || isAnimating) return;
    const timer = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, isPaused, isAnimating, goNext]);

  if (!slides.length) {
    return (
      <div className="detailVisualPanel">
        <div className="detailSlideFrame flex items-center justify-center text-[#9f8d81]">
          No image
        </div>
      </div>
    );
  }

  const hasMany = slides.length > 1;

  return (
    <div
      className="detailVisualPanel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="detailSlideFrame detailCarouselViewport">
        {slides.map((slide, i) => {
          const isActive = i === index;
          const isLeaving = prevIndex === i;
          const isEntering = isActive && prevIndex !== null;

          return (
            <div
              key={slide.id}
              className={cn(
                "detailCarouselSlide",
                isActive && "detailCarouselSlide--active",
                isLeaving &&
                  (direction === "next"
                    ? "detailCarouselSlide--leave-next"
                    : "detailCarouselSlide--leave-prev"),
                isEntering &&
                  (direction === "next"
                    ? "detailCarouselSlide--enter-next"
                    : "detailCarouselSlide--enter-prev"),
                !isActive && !isLeaving && "detailCarouselSlide--idle",
              )}
              aria-hidden={!isActive}
            >
              {!loadedIds[slide.id] && (
                <ShimmerSkeleton className="detailCarouselImageShimmer" aria-hidden />
              )}
              <Image
                src={mediaUrl(slide.path)}
                alt={slide.alt}
                width={760}
                height={540}
                className={cn(
                  "detailProductImage detailCarouselImage",
                  loadedIds[slide.id] && "detailCarouselImage--loaded",
                )}
                sizes="(max-width: 1100px) 100vw, 58vw"
                priority={i === 0}
                onLoad={() => markLoaded(slide.id)}
                onLoadingComplete={() => markLoaded(slide.id)}
              />
            </div>
          );
        })}

        {hasMany && (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={isAnimating}
              className="detailCarouselNav detailCarouselNav--prev"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={isAnimating}
              className="detailCarouselNav detailCarouselNav--next"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {hasMany && (
        <div className="detailCarouselThumbs">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i, i > index ? "next" : "prev")}
              disabled={isAnimating}
              className={cn(
                "detailCarouselThumb",
                i === index && "detailCarouselThumbActive",
              )}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            >
              {!loadedIds[s.id] && <ShimmerSkeleton className="detailCarouselThumbShimmer" aria-hidden />}
              <Image
                src={mediaUrl(s.path)}
                alt=""
                fill
                className={cn("object-contain", loadedIds[s.id] && "detailCarouselThumbImage--loaded")}
                sizes="72px"
                onLoad={() => markLoaded(s.id)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
