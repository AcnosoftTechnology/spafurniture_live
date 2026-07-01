"use client";

import { cn } from "@/lib/utils";
import type { SeoScoreLevel } from "@/lib/seo/score";

const levelStyles: Record<SeoScoreLevel, string> = {
  good: "bg-emerald-500",
  ok: "bg-amber-500",
  poor: "bg-red-500",
  empty: "bg-stone-300",
};

export function LengthIndicator({
  length,
  idealMin,
  idealMax,
  level,
}: {
  length: number;
  idealMin: number;
  idealMax: number;
  level: SeoScoreLevel;
}) {
  const maxBar = idealMax + 30;
  const pct = Math.min(100, (length / maxBar) * 100);
  const idealStart = (idealMin / maxBar) * 100;
  const idealWidth = ((idealMax - idealMin) / maxBar) * 100;

  return (
    <div className="space-y-1">
      <div className="relative h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className="absolute top-0 h-full rounded-full bg-stone-200/80"
          style={{ left: `${idealStart}%`, width: `${idealWidth}%` }}
        />
        <div
          className={cn("absolute left-0 top-0 h-full rounded-full transition-all", levelStyles[level])}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-stone-500">
        {length} / ideal {idealMin}–{idealMax} characters
      </p>
    </div>
  );
}
