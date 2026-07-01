"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaField } from "@/components/admin/cms/media-field";
import type { AdminTestimonialsEditorData } from "@/features/testimonials/get-testimonials-data";
import {
  GOOGLE_REVIEWS_FREE_LIMIT,
  type TestimonialReview,
  type TestimonialsContent,
} from "@/features/testimonials/schemas/testimonials-content.schema";

type AdminContent = AdminTestimonialsEditorData["content"];

function newReview(): TestimonialReview {
  return {
    id: crypto.randomUUID(),
    authorName: "",
    rating: 5,
    body: "",
    publishedAt: new Date().toISOString().slice(0, 10),
    source: "manual",
  };
}

function toSavePayload(content: AdminContent): TestimonialsContent {
  const { google, ...rest } = content;
  const { apiKeyConfigured: _configured, ...googleFields } = google as AdminContent["google"] & {
    apiKeyConfigured?: boolean;
  };
  return { ...rest, google: googleFields };
}

export function TestimonialsEditor({ initialData }: { initialData: AdminTestimonialsEditorData }) {
  const [saving, setSaving] = useState(false);
  const [testingGoogle, setTestingGoogle] = useState(false);
  const [content, setContent] = useState(initialData.content);

  const effectiveLimit = useMemo(() => {
    const hasApi =
      content.google.enabled && (content.google.apiKeyConfigured || content.google.apiKey.trim());
    const manualCount = content.manualReviews.filter(
      (review) => review.body.trim() && review.authorName.trim(),
    ).length;
    if (content.source === "manual" || !hasApi) return manualCount;
    return content.displayCount;
  }, [content]);

  function patchContent(next: AdminContent) {
    setContent(next);
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/v1/admin/testimonials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: toSavePayload(content) }),
    });
    setSaving(false);

    const json = (await res.json()) as { error?: { message?: string } };
    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to save testimonials");
      return;
    }

    setContent((current) => ({
      ...current,
      google: {
        ...current.google,
        apiKey: "",
        apiKeyConfigured: current.google.apiKey.trim()
          ? true
          : current.google.apiKeyConfigured,
      },
    }));
    toast.success("Testimonials saved");
  }

  async function testGoogleConnection() {
    setTestingGoogle(true);
    const res = await fetch("/api/v1/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "test-google",
        placeId: content.google.placeId,
        apiKey: content.google.apiKey,
      }),
    });
    setTestingGoogle(false);

    const json = (await res.json()) as {
      data?: { ok: boolean; count?: number; message?: string };
      error?: { message?: string };
    };

    if (!res.ok) {
      toast.error(json.error?.message ?? "Google API test failed");
      return;
    }

    if (json.data?.ok) {
      toast.success(`Google connected — ${json.data.count ?? 0} reviews returned (API max ${GOOGLE_REVIEWS_FREE_LIMIT})`);
      return;
    }

    toast.error(json.data?.message ?? "Google API test failed");
  }

  function updateReview(index: number, patch: Partial<TestimonialReview>) {
    const manualReviews = content.manualReviews.map((review, i) =>
      i === index ? { ...review, ...patch } : review,
    );
    patchContent({ ...content, manualReviews });
  }

  function removeReview(index: number) {
    patchContent({
      ...content,
      manualReviews: content.manualReviews.filter((_, i) => i !== index),
    });
  }

  function addReview() {
    patchContent({
      ...content,
      manualReviews: [...content.manualReviews, newReview()],
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Homepage section (above FAQ):{" "}
          <Link href="/#testimonials" target="_blank" className="font-medium text-stone-900 underline">
            /#testimonials
          </Link>
        </p>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save testimonials"}
        </Button>
      </div>

      <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
        <p className="font-medium text-stone-800">How display limits work</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            <strong>Manual only:</strong> all saved manual reviews show on the homepage (no 5-review cap).
          </li>
          <li>With Google API (google / mixed): &quot;Display count&quot; limits how many show.</li>
          <li>Google Places API returns at most {GOOGLE_REVIEWS_FREE_LIMIT} reviews per request.</li>
        </ul>
        <p className="mt-2 text-stone-500">
          Effective limit right now: <strong>{effectiveLimit}</strong> review{effectiveLimit === 1 ? "" : "s"}
        </p>
      </div>

      <Tabs defaultValue="section">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="section">Section</TabsTrigger>
          <TabsTrigger value="google">Google API</TabsTrigger>
          <TabsTrigger value="reviews">Manual reviews</TabsTrigger>
          <TabsTrigger value="carousel">Carousel</TabsTrigger>
        </TabsList>

        <TabsContent value="section" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 p-4">
            <div>
              <Label htmlFor="section-enabled">Show on homepage</Label>
              <p className="text-xs text-stone-500">Disable to hide the testimonials block site-wide.</p>
            </div>
            <Switch
              id="section-enabled"
              checked={content.section.enabled}
              onCheckedChange={(checked) =>
                patchContent({ ...content, section: { ...content.section, enabled: checked } })
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="section-title">Section title</Label>
              <Input
                id="section-title"
                value={content.section.title}
                onChange={(e) =>
                  patchContent({ ...content, section: { ...content.section, title: e.target.value } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display-count">Display count</Label>
              <Input
                id="display-count"
                type="number"
                min={1}
                max={50}
                value={content.displayCount}
                onChange={(e) =>
                  patchContent({ ...content, displayCount: Math.max(1, Number(e.target.value) || 1) })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-subtitle">Subtitle (optional)</Label>
            <Input
              id="section-subtitle"
              value={content.section.subtitle}
              onChange={(e) =>
                patchContent({ ...content, section: { ...content.section, subtitle: e.target.value } })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-source">Review source</Label>
            <select
              id="review-source"
              className="flex h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
              value={content.source}
              onChange={(e) =>
                patchContent({
                  ...content,
                  source: e.target.value as TestimonialsContent["source"],
                })
              }
            >
              <option value="manual">Manual only (free)</option>
              <option value="google">Google only (requires API)</option>
              <option value="mixed">Mixed — Google + manual</option>
            </select>
          </div>
        </TabsContent>

        <TabsContent value="google" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 p-4">
            <div>
              <Label htmlFor="google-enabled">Enable Google Places API</Label>
              <p className="text-xs text-stone-500">
                When enabled with valid credentials, display count above {GOOGLE_REVIEWS_FREE_LIMIT} can apply.
              </p>
            </div>
            <Switch
              id="google-enabled"
              checked={content.google.enabled}
              onCheckedChange={(checked) =>
                patchContent({ ...content, google: { ...content.google, enabled: checked } })
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="google-place-id">Google Place ID</Label>
              <Input
                id="google-place-id"
                placeholder="ChIJ..."
                value={content.google.placeId}
                onChange={(e) =>
                  patchContent({ ...content, google: { ...content.google, placeId: e.target.value } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="google-min-rating">Minimum rating</Label>
              <Input
                id="google-min-rating"
                type="number"
                min={1}
                max={5}
                value={content.google.minRating}
                onChange={(e) =>
                  patchContent({
                    ...content,
                    google: {
                      ...content.google,
                      minRating: Math.min(5, Math.max(1, Number(e.target.value) || 1)),
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="google-api-key">Google API key</Label>
            <Input
              id="google-api-key"
              type="password"
              placeholder={content.google.apiKeyConfigured ? "•••••••• (saved — leave blank to keep)" : "Enter API key"}
              value={content.google.apiKey}
              onChange={(e) =>
                patchContent({ ...content, google: { ...content.google, apiKey: e.target.value } })
              }
            />
            {content.google.apiKeyConfigured ? (
              <p className="text-xs text-emerald-700">An API key is saved on the server.</p>
            ) : null}
          </div>

          <Button type="button" variant="outline" onClick={testGoogleConnection} disabled={testingGoogle}>
            {testingGoogle ? "Testing..." : "Test Google connection"}
          </Button>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">{content.manualReviews.length} manual review(s)</p>
            <Button type="button" variant="outline" size="sm" onClick={addReview}>
              <Plus className="mr-1 h-4 w-4" />
              Add review
            </Button>
          </div>

          {content.manualReviews.map((review, index) => (
            <div key={review.id} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-stone-800">Review {index + 1}</p>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeReview(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label>Author name</Label>
                  <Input
                    value={review.authorName}
                    onChange={(e) => updateReview(index, { authorName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating (1–5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={review.rating}
                    onChange={(e) =>
                      updateReview(index, {
                        rating: Math.min(5, Math.max(1, Number(e.target.value) || 5)),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date (optional)</Label>
                <Input
                  value={review.publishedAt ?? ""}
                  placeholder="16/06/2025"
                  onChange={(e) => updateReview(index, { publishedAt: e.target.value })}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-[auto,1fr] md:items-start">
                <MediaField
                  label="Profile photo"
                  previewClassName="h-10 w-10 rounded-full"
                  value={review.avatarUrl ? { path: review.avatarUrl, mediaId: null } : null}
                  onChange={(value) => updateReview(index, { avatarUrl: value?.path ?? undefined })}
                />
                <div className="space-y-2">
                  <Label>Photo URL (optional)</Label>
                  <Input
                    placeholder="Media library or https://… profile image"
                    value={review.avatarUrl ?? ""}
                    onChange={(e) => updateReview(index, { avatarUrl: e.target.value || undefined })}
                  />
                  <p className="text-xs text-stone-500">
                    Google API reviews load photos automatically. Manual reviews need an uploaded image or URL.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Review text</Label>
                <Textarea
                  rows={3}
                  value={review.body}
                  onChange={(e) => updateReview(index, { body: e.target.value })}
                />
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="carousel" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 p-4">
            <div>
              <Label htmlFor="carousel-enabled">Enable carousel</Label>
              <p className="text-xs text-stone-500">When off, reviews render in a static grid.</p>
            </div>
            <Switch
              id="carousel-enabled"
              checked={content.carousel.enabled}
              onCheckedChange={(checked) =>
                patchContent({ ...content, carousel: { ...content.carousel, enabled: checked } })
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 p-4">
              <Label htmlFor="carousel-autoplay">Autoplay</Label>
              <Switch
                id="carousel-autoplay"
                checked={content.carousel.autoplay}
                onCheckedChange={(checked) =>
                  patchContent({ ...content, carousel: { ...content.carousel, autoplay: checked } })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 p-4">
              <Label htmlFor="carousel-loop">Loop</Label>
              <Switch
                id="carousel-loop"
                checked={content.carousel.loop}
                onCheckedChange={(checked) =>
                  patchContent({ ...content, carousel: { ...content.carousel, loop: checked } })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 p-4">
              <Label htmlFor="carousel-nav">Show arrows</Label>
              <Switch
                id="carousel-nav"
                checked={content.carousel.showNavigation}
                onCheckedChange={(checked) =>
                  patchContent({ ...content, carousel: { ...content.carousel, showNavigation: checked } })
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Autoplay delay (ms)</Label>
              <Input
                type="number"
                min={1000}
                max={60000}
                value={content.carousel.autoplayDelayMs}
                onChange={(e) =>
                  patchContent({
                    ...content,
                    carousel: {
                      ...content.carousel,
                      autoplayDelayMs: Math.max(1000, Number(e.target.value) || 5000),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Transition speed (ms)</Label>
              <Input
                type="number"
                min={200}
                max={5000}
                value={content.carousel.speed}
                onChange={(e) =>
                  patchContent({
                    ...content,
                    carousel: {
                      ...content.carousel,
                      speed: Math.max(200, Number(e.target.value) || 600),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Space between slides (px)</Label>
              <Input
                type="number"
                min={0}
                max={80}
                value={content.carousel.spaceBetween}
                onChange={(e) =>
                  patchContent({
                    ...content,
                    carousel: {
                      ...content.carousel,
                      spaceBetween: Math.max(0, Number(e.target.value) || 0),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Slides — mobile</Label>
              <Input
                type="number"
                min={1}
                max={6}
                value={content.carousel.slidesPerView.sm}
                onChange={(e) =>
                  patchContent({
                    ...content,
                    carousel: {
                      ...content.carousel,
                      slidesPerView: {
                        ...content.carousel.slidesPerView,
                        sm: Math.min(6, Math.max(1, Number(e.target.value) || 1)),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Slides — tablet</Label>
              <Input
                type="number"
                min={1}
                max={6}
                value={content.carousel.slidesPerView.md}
                onChange={(e) =>
                  patchContent({
                    ...content,
                    carousel: {
                      ...content.carousel,
                      slidesPerView: {
                        ...content.carousel.slidesPerView,
                        md: Math.min(6, Math.max(1, Number(e.target.value) || 2)),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Slides — desktop</Label>
              <Input
                type="number"
                min={1}
                max={6}
                value={content.carousel.slidesPerView.lg}
                onChange={(e) =>
                  patchContent({
                    ...content,
                    carousel: {
                      ...content.carousel,
                      slidesPerView: {
                        ...content.carousel.slidesPerView,
                        lg: Math.min(6, Math.max(1, Number(e.target.value) || 3)),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
