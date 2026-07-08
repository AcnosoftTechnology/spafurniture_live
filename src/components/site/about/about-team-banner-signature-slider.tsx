"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { mediaUrl } from "@/lib/utils";
import { AboutBannerImage } from "@/components/site/about/about-banner-image";
import { getAboutBannerTiming } from "@/features/about/banner-timing";
import type { AboutBannerSlide } from "@/features/about/schemas/about-content.schema";

const BLADE_COUNT = 5;

type AboutTeamBannerSignatureSliderProps = {
  slides: AboutBannerSlide[];
  autoplaySeconds: number;
};

function SignatureSlideLayer({
  slide,
  textClassName,
}: {
  slide: AboutBannerSlide;
  textClassName?: string;
}) {
  return (
    <>
      <div className="esth-about-team-media">
        <AboutBannerImage src={mediaUrl(slide.imagePath)} alt={slide.alt || "About banner"} />
      </div>
      {slide.overlayText?.trim() ? (
        <p className={`esth-about-team-text${textClassName ? ` ${textClassName}` : ""}`}>{slide.overlayText}</p>
      ) : null}
    </>
  );
}

export function AboutTeamBannerSignatureSlider({
  slides,
  autoplaySeconds,
}: AboutTeamBannerSignatureSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [fromIndex, setFromIndex] = useState(0);
  const [toIndex, setToIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeIndexRef = useRef(activeIndex);
  const lockRef = useRef(false);

  activeIndexRef.current = activeIndex;

  const hasMany = slides.length > 1;
  const { delayMs, transitionMs, bladeMs, sheenMs, bladeStaggerMs } = useMemo(
    () => getAboutBannerTiming(autoplaySeconds),
    [autoplaySeconds],
  );
  const signatureStyle = useMemo(
    () =>
      ({
        "--esth-signature-duration": `${transitionMs}ms`,
        "--esth-signature-blade-duration": `${bladeMs}ms`,
        "--esth-signature-sheen-duration": `${sheenMs}ms`,
      }) as CSSProperties,
    [bladeMs, sheenMs, transitionMs],
  );
  const activeSlide = slides[activeIndex];
  const fromSlide = slides[fromIndex];
  const toSlide = slides[toIndex];

  const goTo = useCallback(
    (nextIndex: number) => {
      const current = activeIndexRef.current;
      if (!hasMany || lockRef.current || nextIndex === current) return;
      lockRef.current = true;
      setFromIndex(current);
      setToIndex(nextIndex);
      setTransitioning(true);
    },
    [hasMany],
  );

  const goNext = useCallback(() => {
    goTo((activeIndexRef.current + 1) % slides.length);
  }, [goTo, slides.length]);

  useEffect(() => {
    if (!transitioning) return;
    const timer = window.setTimeout(() => {
      setActiveIndex(toIndex);
      setTransitioning(false);
      lockRef.current = false;
    }, transitionMs);
    return () => window.clearTimeout(timer);
  }, [transitioning, toIndex, transitionMs]);

  useEffect(() => {
    if (!hasMany || paused || transitioning) return;
    const timer = window.setInterval(goNext, delayMs);
    return () => window.clearInterval(timer);
  }, [delayMs, goNext, hasMany, paused, transitioning, activeIndex]);

  return (
    <section
      className="esth-about-team esth-about-team--signature"
      style={signatureStyle}
      aria-label="About us banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="esth-about-team-slide esth-signature-stage">
        <div
          className={`esth-signature-layer esth-signature-layer--idle${transitioning ? " is-hidden" : ""}`}
          aria-hidden={transitioning}
        >
          <SignatureSlideLayer slide={transitioning ? fromSlide : activeSlide} />
        </div>

        {transitioning ? (
          <>
            <div className="esth-signature-layer esth-signature-layer--in" aria-hidden={false}>
              <SignatureSlideLayer slide={toSlide} textClassName="esth-signature-text--in" />
            </div>

            <div className="esth-signature-blades" aria-hidden>
              {Array.from({ length: BLADE_COUNT }, (_, bladeIndex) => (
                <div
                  key={`blade-${fromIndex}-${bladeIndex}`}
                  className={`esth-signature-blade esth-signature-blade--${bladeIndex % 2 === 0 ? "left" : "right"}`}
                  style={{
                    width: `${100 / BLADE_COUNT}%`,
                    left: `${(bladeIndex * 100) / BLADE_COUNT}%`,
                    backgroundImage: `url(${mediaUrl(fromSlide.imagePath)})`,
                    backgroundSize: `${BLADE_COUNT * 100}% 100%`,
                    backgroundPosition: `${
                      BLADE_COUNT > 1 ? (bladeIndex / (BLADE_COUNT - 1)) * 100 : 0
                    }% 50%`,
                    animationDelay: `${bladeIndex * bladeStaggerMs}ms`,
                  }}
                />
              ))}
            </div>

            <div className="esth-signature-sheen" aria-hidden />
            <div className="esth-signature-grain" aria-hidden />
          </>
        ) : null}
      </div>

      {hasMany ? (
        <div className="esth-about-team-dots" role="tablist" aria-label="Banner slides">
          {slides.map((slide, index) => (
            <button
              key={`${slide.imagePath}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show banner ${index + 1}`}
              className={`esth-about-team-dot${index === activeIndex ? " esth-about-team-dot--active" : ""}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
