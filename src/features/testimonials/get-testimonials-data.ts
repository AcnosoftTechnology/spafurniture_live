import { prisma } from "@/lib/prisma";
import { fetchGooglePlaceReviews } from "@/features/testimonials/fetch-google-reviews";
import {
  defaultTestimonialsContent,
  testimonialsContentSchema,
  TESTIMONIALS_SETTING_KEY,
  type TestimonialDisplayItem,
  type TestimonialReview,
  type TestimonialsContent,
} from "@/features/testimonials/schemas/testimonials-content.schema";

export type TestimonialsSectionData = {
  content: TestimonialsContent;
  reviews: TestimonialDisplayItem[];
  meta: {
    hasGoogleApi: boolean;
    effectiveLimit: number;
    sourceLabel: string;
  };
};

export async function getTestimonialsContent(): Promise<TestimonialsContent> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: TESTIMONIALS_SETTING_KEY } });
    if (!row?.value) return defaultTestimonialsContent;
    return testimonialsContentSchema.parse(row.value);
  } catch {
    return defaultTestimonialsContent;
  }
}

export function sanitizeTestimonialsForAdmin(content: TestimonialsContent) {
  return {
    ...content,
    google: {
      ...content.google,
      apiKey: "",
      apiKeyConfigured: Boolean(content.google.apiKey?.trim()),
    },
  };
}

export function mergeTestimonialsPatch(
  current: TestimonialsContent,
  patch: TestimonialsContent,
): TestimonialsContent {
  const merged = testimonialsContentSchema.parse(patch);
  if (!patch.google.apiKey?.trim() && current.google.apiKey?.trim()) {
    merged.google.apiKey = current.google.apiKey;
  }
  return merged;
}

export async function saveTestimonialsContent(content: TestimonialsContent) {
  const parsed = testimonialsContentSchema.parse(content);
  await prisma.siteSetting.upsert({
    where: { key: TESTIMONIALS_SETTING_KEY },
    update: { value: parsed },
    create: { key: TESTIMONIALS_SETTING_KEY, value: parsed },
  });
  return parsed;
}

function hasGoogleApiConfigured(content: TestimonialsContent) {
  return Boolean(
    content.google.enabled &&
      content.google.apiKey?.trim() &&
      content.google.placeId?.trim(),
  );
}

function getEffectiveDisplayLimit(content: TestimonialsContent, hasGoogleApi: boolean) {
  if (content.source === "manual" || !hasGoogleApi) {
    return content.manualReviews.filter(
      (review) => review.body.trim() && review.authorName.trim(),
    ).length;
  }
  return content.displayCount;
}

function mergeReviews(manual: TestimonialReview[], google: TestimonialReview[]) {
  const seen = new Set<string>();
  const merged: TestimonialReview[] = [];

  for (const review of [...google, ...manual]) {
    const key = `${review.authorName.toLowerCase()}::${review.body.slice(0, 80).toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(review);
  }

  return merged;
}

async function resolveReviews(content: TestimonialsContent): Promise<TestimonialReview[]> {
  const hasGoogleApi = hasGoogleApiConfigured(content);
  const manual = content.manualReviews.filter((review) => review.body.trim() && review.authorName.trim());

  if (!hasGoogleApi || content.source === "manual") {
    return manual;
  }

  let googleReviews: TestimonialReview[] = [];
  try {
    googleReviews = await fetchGooglePlaceReviews(
      content.google.placeId,
      content.google.apiKey,
      content.google.minRating,
    );
  } catch {
    googleReviews = [];
  }

  if (content.source === "google") return googleReviews;
  return mergeReviews(manual, googleReviews);
}

function getSourceLabel(content: TestimonialsContent, hasGoogleApi: boolean) {
  if (content.source === "manual" || !hasGoogleApi) return "Manual";
  if (content.source === "google") return "Google Places API";
  if (content.source === "mixed") return "Mixed (Google + manual)";
  return "Manual";
}

export async function getTestimonialsSectionData(): Promise<TestimonialsSectionData> {
  const content = await getTestimonialsContent();
  const hasGoogleApi = hasGoogleApiConfigured(content);
  const effectiveLimit = getEffectiveDisplayLimit(content, hasGoogleApi);

  if (!content.section.enabled) {
    return {
      content,
      reviews: [],
      meta: {
        hasGoogleApi,
        effectiveLimit,
        sourceLabel: getSourceLabel(content, hasGoogleApi),
      },
    };
  }

  const resolved = await resolveReviews(content);
  const limit =
    content.source === "manual" || !hasGoogleApi
      ? resolved.length
      : Math.min(resolved.length, effectiveLimit);
  const reviews = resolved.slice(0, limit).map((review) => ({
    ...review,
    relativePublishedAt: review.publishedAt,
  }));

  return {
    content,
    reviews,
    meta: {
      hasGoogleApi,
      effectiveLimit,
      sourceLabel: getSourceLabel(content, hasGoogleApi),
    },
  };
}

export type AdminTestimonialsContent = ReturnType<typeof sanitizeTestimonialsForAdmin>;

export type AdminTestimonialsEditorData = {
  content: AdminTestimonialsContent;
};

export async function getAdminTestimonialsEditorData(): Promise<AdminTestimonialsEditorData> {
  const content = await getTestimonialsContent();
  return { content: sanitizeTestimonialsForAdmin(content) };
}
