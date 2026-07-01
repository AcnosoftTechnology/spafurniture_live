"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaField, type MediaFieldValue } from "@/components/admin/cms/media-field";
import type {
  AboutBannerEffect,
  AboutBannerSlide,
  AboutTeamBanner,
} from "@/features/about/schemas/about-content.schema";

const EFFECT_OPTIONS: { value: AboutBannerEffect; label: string }[] = [
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "zoom", label: "Zoom / Bubble" },
  { value: "flip", label: "Flip" },
  { value: "cube", label: "Cube" },
  { value: "signature", label: "Signature reveal (premium)" },
];

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function AboutBannerSliderField({
  value,
  onChange,
}: {
  value: AboutTeamBanner;
  onChange: (next: AboutTeamBanner) => void;
}) {
  const updateSlide = (index: number, slide: AboutBannerSlide) => {
    const slides = [...value.slides];
    slides[index] = slide;
    onChange({ ...value, slides });
  };

  const addSlide = () => {
    onChange({
      ...value,
      slides: [
        ...value.slides,
        {
          imagePath: "",
          mediaId: null,
          alt: "Esthetica team",
          overlayText: value.slides[value.slides.length - 1]?.overlayText ?? "",
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Slide duration (seconds)</Label>
          <Input
            type="number"
            min={2}
            max={60}
            value={value.autoplaySeconds}
            onChange={(e) =>
              onChange({
                ...value,
                autoplaySeconds: Math.min(60, Math.max(2, Number(e.target.value) || 6)),
              })
            }
          />
          <p className="text-xs text-stone-500">
            Controls how long each slide stays visible and how fast the transition animation plays. Lower = faster, higher = slower.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Transition effect</Label>
          <Select
            value={value.transitionEffect}
            onValueChange={(transitionEffect) =>
              onChange({ ...value, transitionEffect: transitionEffect as AboutBannerEffect })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EFFECT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Label className="text-base">Banner slides</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSlide}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add slide
          </Button>
        </div>

        {value.slides.map((slide, index) => {
          const media: MediaFieldValue | null = slide.imagePath
            ? { path: slide.imagePath, mediaId: slide.mediaId ?? null, alt: slide.alt ?? null }
            : null;

          return (
            <div key={`slide-${index}`} className="space-y-4 rounded-lg border border-stone-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Slide {index + 1}</span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === 0}
                    onClick={() => onChange({ ...value, slides: moveItem(value.slides, index, index - 1) })}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === value.slides.length - 1}
                    onClick={() => onChange({ ...value, slides: moveItem(value.slides, index, index + 1) })}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600"
                    disabled={value.slides.length <= 1}
                    onClick={() =>
                      onChange({ ...value, slides: value.slides.filter((_, i) => i !== index) })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <MediaField
                label="Banner image"
                value={media}
                onChange={(next) =>
                  updateSlide(index, {
                    ...slide,
                    imagePath: next?.path ?? "",
                    mediaId: next?.mediaId ?? null,
                    alt: next?.alt ?? slide.alt,
                  })
                }
                previewClassName="h-40 w-full max-w-2xl"
              />

              <div className="space-y-2">
                <Label>Overlay heading text</Label>
                <Textarea
                  rows={3}
                  value={slide.overlayText}
                  onChange={(e) => updateSlide(index, { ...slide, overlayText: e.target.value })}
                  placeholder="Text shown centered on this banner"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
