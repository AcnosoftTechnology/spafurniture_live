"use client";

import { useEffect } from "react";
import type { SeoTabValue } from "@/components/admin/cms/seo-score-panel";

export type SeoManualOverrides = {
  seoTitle: boolean;
  metaDescription: boolean;
  canonicalUrl: boolean;
  ogTitle: boolean;
  ogDescription: boolean;
};

export const defaultManual: SeoManualOverrides = {
  seoTitle: false,
  metaDescription: false,
  canonicalUrl: false,
  ogTitle: false,
  ogDescription: false,
};

export function initialManualFromSeo(seo: {
  seoTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
}): SeoManualOverrides {
  return {
    seoTitle: Boolean(seo.seoTitle?.trim()),
    metaDescription: Boolean(seo.metaDescription?.trim()),
    canonicalUrl: Boolean(seo.canonicalUrl?.trim()),
    ogTitle: Boolean(seo.ogTitle?.trim()),
    ogDescription: Boolean(seo.ogDescription?.trim()),
  };
}

type UseAutoSeoArgs = {
  pageTitle: string;
  pageDescription: string;
  canonicalUrl: string;
  seo: SeoTabValue;
  setSeo: React.Dispatch<React.SetStateAction<SeoTabValue>>;
  manual: SeoManualOverrides;
  setManual: React.Dispatch<React.SetStateAction<SeoManualOverrides>>;
};

export function useAutoSeo({
  pageTitle,
  pageDescription,
  canonicalUrl,
  seo,
  setSeo,
  manual,
}: UseAutoSeoArgs) {
  useEffect(() => {
    setSeo((prev) => {
      const next = { ...prev };
      if (!manual.seoTitle && pageTitle && !prev.seoTitle?.trim()) {
        next.seoTitle = pageTitle;
      }
      if (!manual.ogTitle && pageTitle && !prev.ogTitle?.trim()) {
        next.ogTitle = pageTitle;
      }
      if (!manual.metaDescription && pageDescription && !prev.metaDescription?.trim()) {
        next.metaDescription = pageDescription.slice(0, 160);
      }
      if (!manual.ogDescription && pageDescription && !prev.ogDescription?.trim()) {
        next.ogDescription = pageDescription.slice(0, 200);
      }
      if (!manual.canonicalUrl && canonicalUrl && !prev.canonicalUrl?.trim()) {
        next.canonicalUrl = canonicalUrl;
      }
      return next;
    });
  }, [
    pageTitle,
    pageDescription,
    canonicalUrl,
    manual.seoTitle,
    manual.metaDescription,
    manual.canonicalUrl,
    manual.ogTitle,
    manual.ogDescription,
    setSeo,
  ]);
}

export function markSeoManual(
  setManual: React.Dispatch<React.SetStateAction<SeoManualOverrides>>,
  field: keyof SeoManualOverrides,
) {
  setManual((m) => ({ ...m, [field]: true }));
}
