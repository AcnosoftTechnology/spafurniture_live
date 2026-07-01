import { z } from "zod";

/**
 * Site-wide JSON-LD override (Organization, LocalBusiness, WebSite, etc.).
 * When `globalSchemaJson` is non-empty, auto-generated global schemas are not output.
 */
export const siteSchemaSettingsSchema = z.object({
  globalSchemaJson: z.string().default(""),
});

export type SiteSchemaSettings = z.infer<typeof siteSchemaSettingsSchema>;

export const defaultSiteSchemaSettings: SiteSchemaSettings = {
  globalSchemaJson: "",
};

export const SITE_SCHEMA_SETTING_KEY = "site_schema";
