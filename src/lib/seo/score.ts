/** Yoast-style length scoring for admin SEO panel */

export type SeoScoreLevel = "good" | "ok" | "poor" | "empty";

export type FieldScore = {
  level: SeoScoreLevel;
  label: string;
  message: string;
  length: number;
};

const TITLE_IDEAL_MIN = 50;
const TITLE_IDEAL_MAX = 60;
const META_IDEAL_MIN = 150;
const META_IDEAL_MAX = 160;

export function scoreTitleLength(length: number): FieldScore {
  if (length === 0) {
    return { level: "empty", label: "SEO title", message: "Add an SEO title", length };
  }
  if (length >= TITLE_IDEAL_MIN && length <= TITLE_IDEAL_MAX) {
    return {
      level: "good",
      label: "SEO title",
      message: `Good length (${length} chars). Ideal: ${TITLE_IDEAL_MIN}–${TITLE_IDEAL_MAX}.`,
      length,
    };
  }
  if (length >= 40 && length <= 70) {
    return {
      level: "ok",
      label: "SEO title",
      message: `Acceptable (${length} chars). Aim for ${TITLE_IDEAL_MIN}–${TITLE_IDEAL_MAX}.`,
      length,
    };
  }
  return {
    level: "poor",
    label: "SEO title",
    message:
      length < 40
        ? `Too short (${length} chars). Add more detail.`
        : `Too long (${length} chars). May be truncated in Google.`,
    length,
  };
}

export function scoreMetaDescriptionLength(length: number): FieldScore {
  if (length === 0) {
    return { level: "empty", label: "Meta description", message: "Add a meta description", length };
  }
  if (length >= META_IDEAL_MIN && length <= META_IDEAL_MAX) {
    return {
      level: "good",
      label: "Meta description",
      message: `Good length (${length} chars). Ideal: ${META_IDEAL_MIN}–${META_IDEAL_MAX}.`,
      length,
    };
  }
  if (length >= 120 && length <= 170) {
    return {
      level: "ok",
      label: "Meta description",
      message: `Acceptable (${length} chars). Aim for ${META_IDEAL_MIN}–${META_IDEAL_MAX}.`,
      length,
    };
  }
  return {
    level: "poor",
    label: "Meta description",
    message:
      length < 120
        ? `Too short (${length} chars).`
        : `Too long (${length} chars). May be cut off in search results.`,
    length,
  };
}

export function scorePageHeading(title: string): FieldScore {
  const length = title.trim().length;
  if (length === 0) {
    return { level: "empty", label: "Page heading", message: "Add a page title / heading", length: 0 };
  }
  if (length >= 10 && length <= 80) {
    return { level: "good", label: "Page heading", message: "Heading looks good", length };
  }
  if (length < 10) {
    return { level: "ok", label: "Page heading", message: "Heading is quite short", length };
  }
  return { level: "ok", label: "Page heading", message: "Heading is long but fine for H1", length };
}

export function levelToNumeric(level: SeoScoreLevel): number {
  switch (level) {
    case "good":
      return 100;
    case "ok":
      return 55;
    case "poor":
      return 20;
    default:
      return 0;
  }
}

export function overallSeoScore(scores: FieldScore[]): {
  percent: number;
  level: SeoScoreLevel;
  label: string;
} {
  if (!scores.length) return { percent: 0, level: "empty", label: "Needs work" };
  const avg =
    scores.reduce((sum, s) => sum + levelToNumeric(s.level), 0) / scores.length;
  const percent = Math.round(avg);
  if (percent >= 80) return { percent, level: "good", label: "Good" };
  if (percent >= 45) return { percent, level: "ok", label: "OK" };
  return { percent, level: "poor", label: "Needs improvement" };
}

export const SEO_LIMITS = {
  titleMin: TITLE_IDEAL_MIN,
  titleMax: TITLE_IDEAL_MAX,
  metaMin: META_IDEAL_MIN,
  metaMax: META_IDEAL_MAX,
};
