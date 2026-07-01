"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { EsthContainer } from "@/components/site/layout/esth-container";
import { ScrollReveal } from "@/components/site/motion/scroll-reveal";
import { mediaUrl } from "@/lib/utils";
import type { TestimonialDisplayItem, TestimonialsCarousel } from "@/features/testimonials/schemas/testimonials-content.schema";
import "swiper/css";

const NAV_PREV = "testimonials-nav-prev";
const NAV_NEXT = "testimonials-nav-next";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="esth-testimonial-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className={`esth-testimonial-star ${index < rating ? "is-filled" : ""}`}
          viewBox="0 0 24 24"
          width="18"
          height="18"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          />
        </svg>
      ))}
    </div>
  );
}

function GoogleMark() {
  return (
    <span className="esth-testimonial-google" aria-label="Google review">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    </span>
  );
}

const AVATAR_COLORS = ["#e8874a", "#57a773", "#5b7dbd", "#c06c84"];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function AuthorAvatar({ review }: { review: TestimonialDisplayItem }) {
  const [failed, setFailed] = useState(false);
  const src = review.avatarUrl?.trim() ? mediaUrl(review.avatarUrl) : null;
  const initials = review.authorName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (!src || failed) {
    return (
      <span
        className="esth-testimonial-avatar esth-testimonial-avatar--initials"
        style={{ backgroundColor: avatarColor(review.authorName) }}
      >
        {initials || "?"}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="esth-testimonial-avatar"
      width={40}
      height={40}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

function ReviewCard({ review }: { review: TestimonialDisplayItem }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.body.trim().length > 100;

  return (
    <article className="esth-testimonial-card">
      <header className="esth-testimonial-card-head">
        <div className="esth-testimonial-author">
          <AuthorAvatar review={review} />
          <div>
            <p className="esth-testimonial-name">{review.authorName}</p>
            {review.relativePublishedAt ? (
              <p className="esth-testimonial-date">{review.relativePublishedAt}</p>
            ) : null}
          </div>
        </div>
        <GoogleMark />
      </header>

      <div className="esth-testimonial-rating-row">
        <StarRating rating={review.rating} />
        <span className="esth-testimonial-verified" title="Verified review" aria-hidden>
          <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
            <path d="M9.5 16.2 4.8 11.5l1.4-1.4 3.3 3.3 7.5-7.5 1.4 1.4z" />
          </svg>
        </span>
      </div>

      <div className={`esth-testimonial-content ${expanded ? "is-expanded" : ""}`}>
        <p className="esth-testimonial-body">
          {review.body}
          {expanded && isLong ? (
            <>
              {" "}
              <button
                type="button"
                className="esth-testimonial-readmore esth-testimonial-readmore--inline"
                onClick={() => setExpanded(false)}
              >
                Read less
              </button>
            </>
          ) : null}
        </p>
        {isLong && !expanded ? (
          <button type="button" className="esth-testimonial-readmore" onClick={() => setExpanded(true)}>
            Read more
          </button>
        ) : null}
      </div>
    </article>
  );
}

function TestimonialsGrid({ reviews }: { reviews: TestimonialDisplayItem[] }) {
  return (
    <div className="esth-testimonials-grid">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

function TestimonialsCarousel({
  reviews,
  carousel,
}: {
  reviews: TestimonialDisplayItem[];
  carousel: TestimonialsCarousel;
}) {
  return (
    <div className="esth-testimonials-swiper-wrap">
      <Swiper
        className="esth-testimonials-swiper"
        modules={[Autoplay, Navigation]}
        loop={carousel.loop && reviews.length > carousel.slidesPerView.lg}
        speed={carousel.speed}
        spaceBetween={Math.min(carousel.spaceBetween, 8)}
        watchOverflow
        centeredSlides={false}
        slidesPerGroup={1}
        roundLengths
        autoplay={
          carousel.autoplay
            ? { delay: carousel.autoplayDelayMs, disableOnInteraction: false }
            : false
        }
        navigation={
          carousel.showNavigation
            ? {
                prevEl: `.${NAV_PREV}`,
                nextEl: `.${NAV_NEXT}`,
              }
            : undefined
        }
        breakpoints={{
          0: { slidesPerView: carousel.slidesPerView.sm },
          768: { slidesPerView: carousel.slidesPerView.md },
          992: { slidesPerView: carousel.slidesPerView.lg },
        }}
      >
        {reviews.map((review) => (
          <SwiperSlide key={review.id}>
            <ReviewCard review={review} />
          </SwiperSlide>
        ))}
      </Swiper>

      {carousel.showNavigation ? (
        <>
          <button
            type="button"
            className={`${NAV_PREV} esth-testimonials-nav esth-testimonials-nav--prev`}
            aria-label="Previous testimonial"
          />
          <button
            type="button"
            className={`${NAV_NEXT} esth-testimonials-nav esth-testimonials-nav--next`}
            aria-label="Next testimonial"
          />
        </>
      ) : null}
    </div>
  );
}

export type TestimonialsSectionProps = {
  title: string;
  subtitle?: string;
  reviews: TestimonialDisplayItem[];
  carousel: TestimonialsCarousel;
};

export function TestimonialsSection({ title, subtitle, reviews, carousel }: TestimonialsSectionProps) {
  if (!reviews.length) return null;

  return (
    <section className="esth-testimonials-section" id="testimonials">
      <EsthContainer>
        <ScrollReveal className="esth-testimonials-heading">
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          {carousel.enabled ? (
            <TestimonialsCarousel reviews={reviews} carousel={carousel} />
          ) : (
            <TestimonialsGrid reviews={reviews} />
          )}
        </ScrollReveal>
      </EsthContainer>
    </section>
  );
}
