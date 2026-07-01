"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { OgPanel, type OgPanelValue } from "@/components/admin/cms/og-panel";
import { LengthIndicator } from "@/components/admin/cms/length-indicator";
import {
  overallSeoScore,
  scoreMetaDescriptionLength,
  scorePageHeading,
  scoreTitleLength,
  SEO_LIMITS,
  type SeoScoreLevel,
} from "@/lib/seo/score";
import { markSeoManual, type SeoManualOverrides } from "@/hooks/use-auto-seo";
import type { SeoFields } from "@/types/cms";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

export type SeoTabValue = SeoFields &
  OgPanelValue & {
    schemaJson?: string;
  };

const ringColors: Record<SeoScoreLevel, string> = {
  good: "text-emerald-600 border-emerald-500 bg-emerald-50",
  ok: "text-amber-700 border-amber-500 bg-amber-50",
  poor: "text-red-700 border-red-500 bg-red-50",
  empty: "text-stone-500 border-stone-300 bg-stone-50",
};

type SeoScorePanelProps = {
  pageTitle: string;
  value: SeoTabValue;
  onChange: (v: SeoTabValue) => void;
  manual: SeoManualOverrides;
  setManual: React.Dispatch<React.SetStateAction<SeoManualOverrides>>;
  onResetAuto?: () => void;
};

export function SeoScorePanel({
  pageTitle,
  value,
  onChange,
  manual,
  setManual,
  onResetAuto,
}: SeoScorePanelProps) {
  const titleScore = scoreTitleLength((value.seoTitle ?? "").length);
  const metaScore = scoreMetaDescriptionLength((value.metaDescription ?? "").length);
  const headingScore = scorePageHeading(pageTitle);
  const overall = useMemo(
    () => overallSeoScore([headingScore, titleScore, metaScore]),
    [headingScore, titleScore, metaScore],
  );

  const keywordsStr = (value.keywords ?? []).join(", ");

  return (
    <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">SEO</h3>
        {onResetAuto && (
          <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px]" onClick={onResetAuto}>
            <RotateCcw className="mr-1 h-3 w-3" />
            Sync from page
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border-2 text-center",
            ringColors[overall.level],
          )}
        >
          <span className="text-lg font-bold leading-none">{overall.percent}</span>
          <span className="text-[8px] uppercase tracking-wide">Score</span>
        </div>
        <div>
          <p className={cn("text-sm font-semibold", ringColors[overall.level].split(" ")[0])}>
            {overall.label}
          </p>
          <p className="mt-0.5 text-[11px] text-stone-500">Based on heading, title &amp; description length</p>
        </div>
      </div>

      <ScoreCheckItem score={headingScore} />
      <ScoreCheckItem score={titleScore} />
      <ScoreCheckItem score={metaScore} />

      <div className="space-y-3 border-t border-stone-100 pt-3">
        <div className="space-y-2">
          <Label className="text-xs">SEO title</Label>
          <Input
            value={value.seoTitle ?? ""}
            onChange={(e) => {
              markSeoManual(setManual, "seoTitle");
              markSeoManual(setManual, "ogTitle");
              onChange({ ...value, seoTitle: e.target.value, ogTitle: e.target.value });
            }}
            className={cn(
              "text-sm",
              titleScore.level === "good" && "border-emerald-300",
              titleScore.level === "ok" && "border-amber-300",
              titleScore.level === "poor" && "border-red-300",
            )}
          />
          <LengthIndicator
            length={(value.seoTitle ?? "").length}
            idealMin={SEO_LIMITS.titleMin}
            idealMax={SEO_LIMITS.titleMax}
            level={titleScore.level}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Meta description</Label>
          <Textarea
            rows={4}
            value={value.metaDescription ?? ""}
            onChange={(e) => {
              markSeoManual(setManual, "metaDescription");
              markSeoManual(setManual, "ogDescription");
              onChange({
                ...value,
                metaDescription: e.target.value,
                ogDescription: e.target.value.slice(0, 200),
              });
            }}
            className={cn(
              "text-sm",
              metaScore.level === "good" && "border-emerald-300",
              metaScore.level === "ok" && "border-amber-300",
              metaScore.level === "poor" && "border-red-300",
            )}
          />
          <LengthIndicator
            length={(value.metaDescription ?? "").length}
            idealMin={SEO_LIMITS.metaMin}
            idealMax={SEO_LIMITS.metaMax}
            level={metaScore.level}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Canonical URL</Label>
          <Input
            value={value.canonicalUrl ?? ""}
            onChange={(e) => {
              markSeoManual(setManual, "canonicalUrl");
              onChange({ ...value, canonicalUrl: e.target.value });
            }}
            className="text-xs font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Focus keywords</Label>
          <Input
            value={keywordsStr}
            onChange={(e) =>
              onChange({
                ...value,
                keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean),
              })
            }
            placeholder="spa bed, massage table"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Robots</Label>
          <select
            value={value.robots ?? "index,follow"}
            onChange={(e) => onChange({ ...value, robots: e.target.value })}
            className="flex h-9 w-full rounded-md border border-stone-200 px-2 text-sm"
          >
            <option value="index,follow">index, follow</option>
            <option value="noindex,follow">noindex, follow</option>
            <option value="index,nofollow">index, nofollow</option>
            <option value="noindex,nofollow">noindex, nofollow</option>
          </select>
        </div>
      </div>

      <div className="border-t border-stone-100 pt-3">
        <OgPanel
          value={value}
          onChange={(og) => {
            if (og.ogTitle !== value.ogTitle) markSeoManual(setManual, "ogTitle");
            if (og.ogDescription !== value.ogDescription) markSeoManual(setManual, "ogDescription");
            onChange({ ...value, ...og });
          }}
        />
      </div>

      <div className="space-y-2 border-t border-stone-100 pt-3">
        <Label className="text-xs">Manual schema JSON (optional)</Label>
        <p className="text-[10px] text-stone-500">
          When filled, this replaces all auto-generated schema on this page (Product, Breadcrumb, FAQ, etc.). Leave empty
          to use automatic schema from page content.
        </p>
        <Textarea
          rows={6}
          className="font-mono text-[10px]"
          placeholder='{ "@type": "Product", "name": "..." }'
          value={value.schemaJson ?? ""}
          onChange={(e) => onChange({ ...value, schemaJson: e.target.value })}
        />
      </div>
    </div>
  );
}

function ScoreCheckItem({ score }: { score: ReturnType<typeof scoreTitleLength> }) {
  const dot =
    score.level === "good"
      ? "bg-emerald-500"
      : score.level === "ok"
        ? "bg-amber-500"
        : score.level === "poor"
          ? "bg-red-500"
          : "bg-stone-300";

  return (
    <div className="flex gap-2 text-[11px]">
      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dot)} />
      <div>
        <span className="font-medium text-stone-700">{score.label}</span>
        <p className="text-stone-500">{score.message}</p>
      </div>
    </div>
  );
}
