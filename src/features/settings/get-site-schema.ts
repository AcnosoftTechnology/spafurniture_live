import { prisma } from "@/lib/prisma";
import { hasManualSchema } from "@/lib/seo/manual-schema";
import {
  defaultSiteSchemaSettings,
  siteSchemaSettingsSchema,
  SITE_SCHEMA_SETTING_KEY,
  type SiteSchemaSettings,
} from "./schemas/site-schema.schema";

export async function getSiteSchemaSettings(): Promise<SiteSchemaSettings> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: SITE_SCHEMA_SETTING_KEY } });
    if (!row?.value || typeof row.value !== "object") return defaultSiteSchemaSettings;
    return siteSchemaSettingsSchema.parse(row.value);
  } catch {
    return defaultSiteSchemaSettings;
  }
}

export async function saveSiteSchemaSettings(settings: SiteSchemaSettings): Promise<SiteSchemaSettings> {
  const parsed = siteSchemaSettingsSchema.parse(settings);
  await prisma.siteSetting.upsert({
    where: { key: SITE_SCHEMA_SETTING_KEY },
    update: { value: parsed },
    create: { key: SITE_SCHEMA_SETTING_KEY, value: parsed },
  });
  return parsed;
}

export async function isGlobalManualSchemaActive(): Promise<boolean> {
  const { globalSchemaJson } = await getSiteSchemaSettings();
  return hasManualSchema(globalSchemaJson);
}
