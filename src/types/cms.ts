/** Form/editor state — all fields present (may be empty strings). */
export type SeoFields = {
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  robots: string;
};

export type OgFields = {
  ogTitle?: string;
  ogDescription?: string;
  ogImageId?: string | null;
  twitterCard?: string;
};

export type ProductAdminPayload = {
  title: string;
  slug: string;
  shortDesc?: string;
  dimensions?: string;
  dimensionsMediaId?: string | null;
  featuresMediaId?: string | null;
  fullDesc?: unknown;
  priceDisplay?: string;
  featured?: boolean;
  status?: string;
  sortOrder?: number;
  brochureMediaId?: string | null;
  brochureExternalUrl?: string | null;
  brochureExternalLabel?: string | null;
  youtubeUrl?: string | null;
  youtubeLabel?: string | null;
  categoryIds?: string[];
  galleryMediaIds?: string[];
  features?: { label: string; value: string }[];
  attributes?: { key: string; value: string }[];
  schemaJson?: unknown;
} & SeoFields &
  OgFields;

export type BlogAdminPayload = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: unknown;
  status?: string;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  featuredMediaId?: string | null;
  authorId?: string;
  categoryIds?: string[];
  tagIds?: string[];
} & SeoFields &
  OgFields;

export type CategoryAdminPayload = {
  title: string;
  slug: string;
  description?: string;
  homepageFeatureContent?: string;
  homepageFeatureBgMediaId?: string | null;
  pageContent?: unknown;
  status?: string;
  sortOrder?: number;
  showInProductNav?: boolean;
  menuLabel?: string | null;
  bannerMediaId?: string | null;
  thumbMediaId?: string | null;
  galleryMediaIds?: string[];
  schemaJson?: unknown;
} & SeoFields &
  OgFields;

export type PageAdminPayload = {
  title: string;
  slug: string;
  content?: unknown;
  /** HTML snapshot for legacy/category SEO blocks and category SEO sync */
  contentHtml?: string;
  template?: string;
  status?: string;
  publishedAt?: string | null;
  schemaJson?: unknown;
  syncCategoryCopy?: boolean;
} & SeoFields &
  OgFields;
