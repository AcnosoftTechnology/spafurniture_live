"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { SectionButton } from "@/components/site/home/section-button";
import { EsthContainer } from "@/components/site/layout/esth-container";
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from "@/components/site/motion/scroll-reveal";
import { mediaUrl } from "@/lib/utils";
import type { HomepageContent } from "@/features/homepage/schemas/homepage-content.schema";
import "swiper/css";

type SliderData = HomepageContent["howWeDo"] | HomepageContent["clients"];

type LogoSliderSectionProps = {
  id: string;
  sectionClassName: string;
  data: SliderData;
  slidesPerView: { sm: number; md: number; lg: number };
  navigationClass: string;
  cta?: { label: string; href: string } | null;
  compactLogos?: boolean;
};

export function LogoSliderSection({
  id,
  sectionClassName,
  data,
  slidesPerView,
  navigationClass,
  cta,
  compactLogos = false,
}: LogoSliderSectionProps) {
  const logoWidth = compactLogos ? 100 : 130;
  const logoHeight = compactLogos ? 62 : 80;
  return (
    <section className={sectionClassName} id={id}>
      <EsthContainer>
        <ScrollReveal className="esth-client-heading">
          <span>{data.tag}</span>
          <h2>{data.title}</h2>
          {data.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </ScrollReveal>

        <div className="custom-swiper-wrap">
  <Swiper
        modules={[Autoplay, Navigation]}
        loop={true}
      autoplay={{
        delay: 1,
        disableOnInteraction: false,
      }}
      speed={2000}
        spaceBetween={16}
        navigation={{
          nextEl: `.${navigationClass}-next`,
          prevEl: `.${navigationClass}-prev`,
        }}
        breakpoints={{
          0: { slidesPerView: 1 },
          576: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          992: { slidesPerView: 4 },
        }}
      >
        {data.logos.map((item) => (
          <SwiperSlide key={`${item.title}-${item.imagePath}`}>
            <div className="esth-client-logo-box">
              <Image
                src={mediaUrl(item.imagePath)}
                alt={item.title}
                width={130}
                height={80}
                sizes="130px"
                className="mx-auto h-auto max-w-[130px] object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
</Swiper>
          <button
            type="button"
            className={`${navigationClass}-prev swiper-button-prev custom-nav-btn`}
            aria-label="Previous slide"
          >
            &#10094;
          </button>

          <button
            type="button"
            className={`${navigationClass}-next swiper-button-next custom-nav-btn`}
            aria-label="Next slide"
          >
            &#10095;
          </button>
        </div>

        {cta ? <SectionButton label={cta.label} href={cta.href} /> : null}
      </EsthContainer>
    </section>
  );
}
