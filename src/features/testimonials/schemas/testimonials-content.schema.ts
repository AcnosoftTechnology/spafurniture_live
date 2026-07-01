import { z } from "zod";
import defaultData from "@/features/testimonials/default-testimonials-data.json";

export const GOOGLE_REVIEWS_FREE_LIMIT = 5;

export const testimonialReviewSchema = z.object({
  id: z.string(),
  authorName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(1),
  publishedAt: z.string().optional(),
  source: z.enum(["manual", "google"]).default("manual"),
  avatarUrl: z.string().optional(),
});

export const testimonialsCarouselSchema = z.object({
  enabled: z.boolean().default(true),
  autoplay: z.boolean().default(true),
  autoplayDelayMs: z.number().int().min(1000).max(60000).default(5000),
  loop: z.boolean().default(true),
  speed: z.number().int().min(200).max(5000).default(600),
  slidesPerView: z.object({
    sm: z.number().int().min(1).max(6).default(1),
    md: z.number().int().min(1).max(6).default(2),
    lg: z.number().int().min(1).max(6).default(3),
  }),
  showNavigation: z.boolean().default(true),
  spaceBetween: z.number().int().min(0).max(80).default(8),
});

export const testimonialsGoogleSchema = z.object({
  enabled: z.boolean().default(false),
  placeId: z.string().default(""),
  apiKey: z.string().default(""),
  minRating: z.number().int().min(1).max(5).default(1),
});

export const testimonialsContentSchema = z.object({
  section: z.object({
    enabled: z.boolean().default(true),
    title: z.string().default("Testimonials"),
    subtitle: z.string().default(""),
  }),
  displayCount: z.number().int().min(1).max(50).default(5),
  source: z.enum(["manual", "google", "mixed"]).default("manual"),
  google: testimonialsGoogleSchema,
  carousel: testimonialsCarouselSchema,
  manualReviews: z.array(testimonialReviewSchema),
});

export type TestimonialReview = z.infer<typeof testimonialReviewSchema>;
export type TestimonialsCarousel = z.infer<typeof testimonialsCarouselSchema>;
export type TestimonialsGoogle = z.infer<typeof testimonialsGoogleSchema>;
export type TestimonialsContent = z.infer<typeof testimonialsContentSchema>;

export type TestimonialDisplayItem = TestimonialReview & {
  relativePublishedAt?: string;
};

export const defaultTestimonialsContent: TestimonialsContent =
  testimonialsContentSchema.parse(defaultData);

export const TESTIMONIALS_SETTING_KEY = "testimonials";
