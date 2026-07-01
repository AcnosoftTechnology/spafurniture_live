import type { TestimonialReview } from "@/features/testimonials/schemas/testimonials-content.schema";

type GooglePlacesReview = {
  name?: string;
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  publishTime?: string;
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
  };
};

type GooglePlacesResponse = {
  reviews?: GooglePlacesReview[];
  error?: { message?: string; status?: string };
};

function formatRelativeDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function mapGoogleReview(review: GooglePlacesReview, index: number): TestimonialReview | null {
  const authorName = review.authorAttribution?.displayName?.trim();
  const body = (review.text?.text ?? review.originalText?.text ?? "").trim();
  const rating = review.rating ?? 0;

  if (!authorName || !body || rating < 1) return null;

  return {
    id: `google-${review.name ?? index}`,
    authorName,
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    body,
    publishedAt: review.publishTime,
    source: "google",
    avatarUrl: review.authorAttribution?.photoUri,
  };
}

export async function fetchGooglePlaceReviews(
  placeId: string,
  apiKey: string,
  minRating = 1,
): Promise<TestimonialReview[]> {
  const trimmedPlaceId = placeId.trim();
  const trimmedKey = apiKey.trim();
  if (!trimmedPlaceId || !trimmedKey) return [];

  const encodedPlaceId = encodeURIComponent(trimmedPlaceId);
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodedPlaceId}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": trimmedKey,
      "X-Goog-FieldMask": "reviews",
    },
    next: { revalidate: 3600, tags: ["testimonials-google"] },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Google Places API error (${response.status})`);
  }

  const data = (await response.json()) as GooglePlacesResponse;
  const reviews = data.reviews ?? [];

  return reviews
    .map((review, index) => mapGoogleReview(review, index))
    .filter((review): review is TestimonialReview => review !== null && review.rating >= minRating)
    .map((review) => ({
      ...review,
      publishedAt: formatRelativeDate(review.publishedAt) ?? review.publishedAt,
    }));
}

export async function testGooglePlaceReviewsConnection(
  placeId: string,
  apiKey: string,
): Promise<{ ok: true; count: number } | { ok: false; message: string }> {
  try {
    const reviews = await fetchGooglePlaceReviews(placeId, apiKey, 1);
    return { ok: true, count: reviews.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to connect to Google Places API";
    return { ok: false, message };
  }
}
