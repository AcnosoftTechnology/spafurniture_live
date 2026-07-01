"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { mediaUrl } from "@/lib/utils";
import "swiper/css";

export type AboutGalleryItem = {
  imagePath: string;
  alt?: string;
};

type AboutGalleryCarouselProps = {
  items: AboutGalleryItem[];
};

export function AboutGalleryCarousel({ items }: AboutGalleryCarouselProps) {
  const gallerySwiperRef = useRef<SwiperType | null>(null);
  const lightboxSwiperRef = useRef<SwiperType | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxKey, setLightboxKey] = useState(0);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxKey((k) => k + 1);
    setLightboxOpen(true);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, closeLightbox]);

  if (!items.length) return null;

  const hasMany = items.length > 1;

  return (
    <>
      <div className="esth-about-gallery-wrap">
        <Swiper
          modules={[Autoplay]}
          onSwiper={(swiper) => {
            gallerySwiperRef.current = swiper;
          }}
          loop={hasMany}
          speed={900}
          slidesPerGroup={1}
          spaceBetween={10}
          autoplay={
            hasMany
              ? { delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }
              : false
          }
          breakpoints={{
            0: { slidesPerView: 1 },
            576: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
          className="esth-about-gallery-swiper"
        >
          {items.map((item, index) => (
            <SwiperSlide key={`${item.imagePath}-${index}`}>
              <button
                type="button"
                className="esth-about-gallery-slide"
                onClick={() => openLightbox(index)}
                aria-label={`Open image ${index + 1}${item.alt ? `: ${item.alt}` : ""}`}
              >
                <Image
                  src={mediaUrl(item.imagePath)}
                  alt={item.alt ?? `Workshop ${index + 1}`}
                  width={480}
                  height={360}
                  className="esth-about-gallery-img"
                  sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 25vw"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>

        {hasMany ? (
          <>
            <button
              type="button"
              className="esth-about-carousel-nav esth-about-carousel-nav--prev esth-about-carousel-nav--gallery"
              onClick={() => gallerySwiperRef.current?.slidePrev()}
              aria-label="Previous image"
            >
              <ChevronLeft aria-hidden />
            </button>
            <button
              type="button"
              className="esth-about-carousel-nav esth-about-carousel-nav--next esth-about-carousel-nav--gallery"
              onClick={() => gallerySwiperRef.current?.slideNext()}
              aria-label="Next image"
            >
              <ChevronRight aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div
          className="esth-about-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <button
            type="button"
            className="esth-about-lightbox-close"
            onClick={closeLightbox}
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>

          <div className="esth-about-lightbox-panel" onClick={(e) => e.stopPropagation()}>
            <Swiper
              key={lightboxKey}
              modules={[Keyboard]}
              onSwiper={(swiper) => {
                lightboxSwiperRef.current = swiper;
              }}
              initialSlide={lightboxIndex}
              loop={hasMany}
              speed={500}
              slidesPerView={1}
              spaceBetween={0}
              keyboard={{ enabled: true }}
              className="esth-about-lightbox-swiper"
            >
              {items.map((item, index) => (
                <SwiperSlide key={`lb-${item.imagePath}-${index}`}>
                  <div className="esth-about-lightbox-slide">
                    <Image
                      src={mediaUrl(item.imagePath)}
                      alt={item.alt ?? `Workshop ${index + 1}`}
                      width={1200}
                      height={900}
                      className="esth-about-lightbox-img"
                      sizes="90vw"
                      priority={index === lightboxIndex}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {hasMany ? (
              <>
                <button
                  type="button"
                  className="esth-about-carousel-nav esth-about-carousel-nav--prev esth-about-carousel-nav--lightbox"
                  onClick={() => lightboxSwiperRef.current?.slidePrev()}
                  aria-label="Previous image"
                >
                  <ChevronLeft aria-hidden />
                </button>
                <button
                  type="button"
                  className="esth-about-carousel-nav esth-about-carousel-nav--next esth-about-carousel-nav--lightbox"
                  onClick={() => lightboxSwiperRef.current?.slideNext()}
                  aria-label="Next image"
                >
                  <ChevronRight aria-hidden />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
