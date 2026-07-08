"use client";

import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  EffectCreative,
  EffectCube,
  EffectFade,
  EffectFlip,
  Pagination,
} from "swiper/modules";
import { mediaUrl } from "@/lib/utils";
import { AboutBannerImage } from "@/components/site/about/about-banner-image";
import { AboutTeamBannerSignatureSlider } from "@/components/site/about/about-team-banner-signature-slider";
import { getAboutBannerTiming } from "@/features/about/banner-timing";
import type { AboutBannerEffect, AboutTeamBanner } from "@/features/about/schemas/about-content.schema";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/effect-flip";
import "swiper/css/effect-cube";
import "swiper/css/effect-creative";
import "swiper/css/pagination";

type AboutTeamBannerSliderProps = {
  banner: AboutTeamBanner;
};

function getEffectConfig(effect: AboutBannerEffect) {
  switch (effect) {
    case "fade":
      return {
        effect: "fade" as const,
        modules: [Autoplay, EffectFade, Pagination],
        fadeEffect: { crossFade: true },
      };
    case "slide":
      return {
        effect: "slide" as const,
        modules: [Autoplay, Pagination],
      };
    case "zoom":
      return {
        effect: "creative" as const,
        modules: [Autoplay, EffectCreative, Pagination],
        creativeEffect: {
          limitProgress: 1,
          prev: {
            translate: ["-18%", 0, -200],
            scale: 0.86,
            opacity: 0,
          },
          next: {
            translate: ["18%", 0, -200],
            scale: 1.12,
            opacity: 0,
          },
        },
      };
    case "flip":
      return {
        effect: "flip" as const,
        modules: [Autoplay, EffectFlip, Pagination],
        flipEffect: { slideShadows: false },
      };
    case "cube":
      return {
        effect: "cube" as const,
        modules: [Autoplay, EffectCube, Pagination],
        cubeEffect: { shadow: false, slideShadows: false },
      };
    default:
      return {
        effect: "fade" as const,
        modules: [Autoplay, EffectFade, Pagination],
        fadeEffect: { crossFade: true },
      };
  }
}

export function AboutTeamBannerSlider({ banner }: AboutTeamBannerSliderProps) {
  const slides = banner.slides.filter((slide) => slide.imagePath?.trim());
  const hasMany = slides.length > 1;
  const effectConfig = useMemo(() => getEffectConfig(banner.transitionEffect), [banner.transitionEffect]);
  const { delayMs, transitionMs } = useMemo(
    () => getAboutBannerTiming(banner.autoplaySeconds),
    [banner.autoplaySeconds],
  );

  if (!slides.length) return null;

  if (banner.transitionEffect === "signature") {
    return <AboutTeamBannerSignatureSlider slides={slides} autoplaySeconds={banner.autoplaySeconds} />;
  }

  return (
    <section className="esth-about-team" aria-label="About us banner">
      <Swiper
        className="esth-about-team-swiper"
        modules={effectConfig.modules}
        effect={effectConfig.effect}
        fadeEffect={"fadeEffect" in effectConfig ? effectConfig.fadeEffect : undefined}
        creativeEffect={"creativeEffect" in effectConfig ? effectConfig.creativeEffect : undefined}
        flipEffect={"flipEffect" in effectConfig ? effectConfig.flipEffect : undefined}
        cubeEffect={"cubeEffect" in effectConfig ? effectConfig.cubeEffect : undefined}
        loop={hasMany}
        speed={transitionMs}
        slidesPerView={1}
        autoHeight
        autoplay={
          hasMany
            ? { delay: delayMs, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        pagination={hasMany ? { clickable: true } : false}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`${slide.imagePath}-${index}`}>
            <div className="esth-about-team-slide">
              <div className="esth-about-team-media">
                <AboutBannerImage
                  src={mediaUrl(slide.imagePath)}
                  alt={slide.alt || `About banner ${index + 1}`}
                  priority={index === 0}
                />
                <div className="esth-about-team-overlay" aria-hidden />
              </div>
              {slide.overlayText?.trim() ? (
                <p className="esth-about-team-text">{slide.overlayText}</p>
              ) : null}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
