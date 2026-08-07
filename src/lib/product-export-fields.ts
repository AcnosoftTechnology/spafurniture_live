/** Selectable product export fields (shared by admin UI + API). */

export type ProductExportFieldGroup =
  | "Identity"
  | "Content"
  | "Categories"
  | "Media"
  | "Specs"
  | "Relations"
  | "SEO";

export type ProductExportFieldDef = {
  key: string;
  label: string;
  group: ProductExportFieldGroup;
  /** Top-level JSON keys to keep on each product */
  jsonKeys: string[];
  /** CSV column keys (flat) */
  csvColumns: string[];
};

export const PRODUCT_EXPORT_FIELDS: ProductExportFieldDef[] = [
  { key: "id", label: "ID", group: "Identity", jsonKeys: ["id"], csvColumns: ["id"] },
  { key: "title", label: "Title", group: "Identity", jsonKeys: ["title"], csvColumns: ["title"] },
  { key: "slug", label: "Slug", group: "Identity", jsonKeys: ["slug"], csvColumns: ["slug"] },
  {
    key: "url",
    label: "Live URL",
    group: "Identity",
    jsonKeys: ["url"],
    csvColumns: ["url"],
  },
  { key: "status", label: "Status", group: "Identity", jsonKeys: ["status"], csvColumns: ["status"] },
  {
    key: "featured",
    label: "Featured",
    group: "Identity",
    jsonKeys: ["featured"],
    csvColumns: ["featured"],
  },
  {
    key: "sortOrder",
    label: "Sort order",
    group: "Identity",
    jsonKeys: ["sortOrder"],
    csvColumns: ["sortOrder"],
  },
  { key: "locale", label: "Locale", group: "Identity", jsonKeys: ["locale"], csvColumns: ["locale"] },
  {
    key: "publishedAt",
    label: "Published at",
    group: "Identity",
    jsonKeys: ["publishedAt"],
    csvColumns: ["publishedAt"],
  },
  {
    key: "createdAt",
    label: "Created at",
    group: "Identity",
    jsonKeys: ["createdAt"],
    csvColumns: ["createdAt"],
  },
  {
    key: "updatedAt",
    label: "Updated at",
    group: "Identity",
    jsonKeys: ["updatedAt"],
    csvColumns: ["updatedAt"],
  },

  {
    key: "shortDesc",
    label: "Short description",
    group: "Content",
    jsonKeys: ["shortDesc"],
    csvColumns: ["shortDesc"],
  },
  {
    key: "fullDesc",
    label: "Full description",
    group: "Content",
    jsonKeys: ["fullDesc"],
    csvColumns: ["fullDesc"],
  },
  {
    key: "dimensions",
    label: "Dimensions text",
    group: "Content",
    jsonKeys: ["dimensions"],
    csvColumns: ["dimensions"],
  },
  {
    key: "priceDisplay",
    label: "Price display",
    group: "Content",
    jsonKeys: ["priceDisplay"],
    csvColumns: ["priceDisplay"],
  },
  {
    key: "youtube",
    label: "YouTube URL / label",
    group: "Content",
    jsonKeys: ["youtubeUrl", "youtubeLabel"],
    csvColumns: ["youtubeUrl", "youtubeLabel"],
  },
  {
    key: "brochureExternal",
    label: "External brochure URL / label",
    group: "Content",
    jsonKeys: ["brochureExternalUrl", "brochureExternalLabel"],
    csvColumns: ["brochureExternalUrl", "brochureExternalLabel"],
  },
  {
    key: "hreflangGroupId",
    label: "Hreflang group ID",
    group: "Content",
    jsonKeys: ["hreflangGroupId"],
    csvColumns: ["hreflangGroupId"],
  },

  {
    key: "categories",
    label: "Categories (id + name + primary)",
    group: "Categories",
    jsonKeys: ["categories", "categoryIds", "categoryTitles", "primaryCategory"],
    csvColumns: ["categoryIds", "categoryTitles", "primaryCategoryId", "primaryCategoryTitle"],
  },

  {
    key: "gallery",
    label: "Gallery images",
    group: "Media",
    jsonKeys: ["gallery"],
    csvColumns: ["galleryMediaIds", "galleryPaths"],
  },
  {
    key: "dimensionsMedia",
    label: "Dimensions media",
    group: "Media",
    jsonKeys: ["dimensionsMedia"],
    csvColumns: ["dimensionsMediaId", "dimensionsMediaPath"],
  },
  {
    key: "featuresMedia",
    label: "Features media",
    group: "Media",
    jsonKeys: ["featuresMedia"],
    csvColumns: ["featuresMediaId", "featuresMediaPath"],
  },
  {
    key: "brochureMedia",
    label: "Brochure media",
    group: "Media",
    jsonKeys: ["brochureMedia"],
    csvColumns: ["brochureMediaId", "brochureMediaPath"],
  },
  {
    key: "ogImage",
    label: "OG image media",
    group: "Media",
    jsonKeys: ["ogImage"],
    csvColumns: ["ogImageId", "ogImagePath"],
  },

  {
    key: "features",
    label: "Feature rows",
    group: "Specs",
    jsonKeys: ["features"],
    csvColumns: ["features"],
  },
  {
    key: "attributes",
    label: "Attributes (key/value)",
    group: "Specs",
    jsonKeys: ["attributes"],
    csvColumns: ["attributes"],
  },
  {
    key: "sections",
    label: "Sections",
    group: "Specs",
    jsonKeys: ["sections"],
    csvColumns: ["sections"],
  },
  { key: "tabs", label: "Tabs", group: "Specs", jsonKeys: ["tabs"], csvColumns: ["tabs"] },

  {
    key: "relatedProducts",
    label: "Related products",
    group: "Relations",
    jsonKeys: ["relatedProducts"],
    csvColumns: ["relatedProductIds", "relatedProductSlugs"],
  },

  {
    key: "seo",
    label: "SEO / Meta (title, description, keywords, OG, schema…)",
    group: "SEO",
    jsonKeys: ["seo"],
    csvColumns: [
      "seoTitle",
      "metaDescription",
      "keywords",
      "canonicalUrl",
      "robots",
      "ogTitle",
      "ogDescription",
      "twitterCard",
      "schemaJson",
    ],
  },
];

export const PRODUCT_EXPORT_FIELD_KEYS = PRODUCT_EXPORT_FIELDS.map((f) => f.key);

export const PRODUCT_EXPORT_GROUPS: ProductExportFieldGroup[] = [
  "Identity",
  "Content",
  "Categories",
  "Media",
  "Specs",
  "Relations",
  "SEO",
];

export function resolveExportFieldDefs(fieldKeys: string[] | undefined): ProductExportFieldDef[] {
  if (!fieldKeys?.length) return PRODUCT_EXPORT_FIELDS;
  const wanted = new Set(fieldKeys);
  const selected = PRODUCT_EXPORT_FIELDS.filter((f) => wanted.has(f.key));
  return selected.length ? selected : PRODUCT_EXPORT_FIELDS;
}
