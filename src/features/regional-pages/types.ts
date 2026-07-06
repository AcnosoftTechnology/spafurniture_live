export const LEGACY_REGIONAL_SLUGS = ["uae", "saudi-arabia", "qatar"] as const;

export type LegacyRegionalSlug = (typeof LEGACY_REGIONAL_SLUGS)[number];

export type RegionalPageSlug = string;
