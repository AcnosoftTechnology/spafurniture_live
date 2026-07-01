"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { ParallaxSectionBg } from "@/components/site/home/parallax-section-bg";
import { EsthContainer } from "@/components/site/layout/esth-container";
import { ScrollReveal } from "@/components/site/motion/scroll-reveal";
import { mediaUrl } from "@/lib/utils";
import type { HomepageContent } from "@/features/homepage/schemas/homepage-content.schema";
import "swiper/css";

const NAV_PREV = "how-we-nav-prev";
const NAV_NEXT = "how-we-nav-next";

export function HowWeDoSection({ data }: { data: HomepageContent["howWeDo"] }) {
  return (
    <section className="esth-client-section how-what" id="what-we-do">
      <ParallaxSectionBg
        className="esth-how-we-bg"
        imageUrl="/assets/images/bg-wood.png"
        maxShift={220}
        strength={1.85}
      />
      <div className="esth-how-we-overlay" aria-hidden />

      <EsthContainer>
        <ScrollReveal className="esth-how-we-heading">
          <span>{data.tag}</span>
          <h2>{data.title}</h2>
          {data.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </ScrollReveal>
      </EsthContainer>

      <ScrollReveal className="esth-project-swiper-wrap" delay={0.1}>
        <Swiper
          className="esth-project-swiper"
          modules={[Autoplay, Navigation]}
          loop
          speed={800}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          spaceBetween={0}
          navigation={{
            prevEl: `.${NAV_PREV}`,
            nextEl: `.${NAV_NEXT}`,
          }}
          breakpoints={{
            0: { slidesPerView: 1.12, spaceBetween: 0 },
            576: { slidesPerView: 1, spaceBetween: 0 },
            768: { slidesPerView: 3, spaceBetween: 0 },
            992: { slidesPerView: 4, spaceBetween: 0 },
            1200: { slidesPerView: 4, spaceBetween: 0 },
            1600: { slidesPerView: 6, spaceBetween: 0 },
          }}
        >
          {data.logos.map((item) => (
            <SwiperSlide key={`${item.title}-${item.imagePath}`} className="esth-project-swiper-slide">
              <figure className="esth-project-slide">
                <Image
                  src={mediaUrl(item.imagePath)}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 92vw, (max-width: 1400px) 20vw, 17vw"
                  className="esth-project-slide-img"
                />
                <figcaption className="esth-project-slide-caption">{item.title}</figcaption>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          className={`${NAV_PREV} esth-project-nav-btn esth-project-nav-btn--prev`}
          aria-label="Previous slide"
        />
        <button
          type="button"
          className={`${NAV_NEXT} esth-project-nav-btn esth-project-nav-btn--next`}
          aria-label="Next slide"
        />
      </ScrollReveal>
    </section>
  );
}
