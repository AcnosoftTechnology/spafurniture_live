import type { DistributorsPageContent } from "./schemas/distributors-content.schema";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainTextToHtml(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return `<p>${escapeHtml(trimmed)}</p>`;
}

function regionsToHtml(regions: string[]) {
  const items = regions
    .map((region) => region.trim())
    .filter(Boolean)
    .map((region) => `<li>${escapeHtml(region)}</li>`)
    .join("");
  return items ? `<ul>${items}</ul>` : "";
}

export function normalizeDistributorsContent(value: unknown): DistributorsPageContent {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid distributors content");
  }

  const raw = value as Record<string, unknown>;
  const intro = (raw.intro ?? {}) as Record<string, unknown>;
  const sidebar = (raw.sidebar ?? {}) as Record<string, unknown>;

  const introBody =
    typeof intro.body === "string"
      ? /<[a-z][\s\S]*>/i.test(intro.body)
        ? intro.body
        : plainTextToHtml(intro.body)
      : "";

  const regionsHtml =
    typeof sidebar.regionsHtml === "string"
      ? sidebar.regionsHtml
      : Array.isArray(sidebar.regions)
        ? regionsToHtml(sidebar.regions.map(String))
        : "";

  const ctaHtml =
    typeof sidebar.ctaHtml === "string"
      ? sidebar.ctaHtml
      : typeof sidebar.cta === "string"
        ? plainTextToHtml(sidebar.cta)
        : "";

  return {
    intro: {
      eyebrow: String(intro.eyebrow ?? ""),
      title: String(intro.title ?? ""),
      body: introBody,
    },
    sidebar: {
      heading: String(sidebar.heading ?? ""),
      regionsHtml,
      ctaHtml,
      socialTitle: String(sidebar.socialTitle ?? "Follow Us"),
    },
  };
}

export function hasVisibleHtml(html: string) {
  return Boolean(html.replace(/<[^>]*>/g, "").trim() || /<img[\s>]/i.test(html));
}
