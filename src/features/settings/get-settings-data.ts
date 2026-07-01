import { prisma } from "@/lib/prisma";
import type { NavItem } from "@/components/site/site-header";
import { getSitemapMeta, type SitemapMeta } from "@/features/seo/sitemap/sitemap-meta";
import {
  defaultSiteConfig,
  siteConfigSchema,
  SITE_SETTING_KEY,
  type SiteConfig,
} from "./schemas/site-config.schema";
import { getSiteSchemaSettings } from "./get-site-schema";
import type { SiteSchemaSettings } from "./schemas/site-schema.schema";

export type NavEditorItem = {
  clientId: string;
  label: string;
  url: string;
  children: NavEditorItem[];
};

export type AdminSiteConfig = SiteConfig & {
  email: SiteConfig["email"] & { smtpPassConfigured?: boolean };
};

export type AdminSettingsEditorData = {
  site: AdminSiteConfig;
  navigation: NavEditorItem[];
  sitemapMeta: SitemapMeta | null;
  siteSchema: SiteSchemaSettings;
};

function migrateLegacySiteConfig(raw: Record<string, unknown>): SiteConfig {
  const socialRaw = raw.social;
  let social = defaultSiteConfig.social;

  if (Array.isArray(socialRaw)) {
    social = socialRaw as SiteConfig["social"];
  } else if (socialRaw && typeof socialRaw === "object") {
    social = Object.entries(socialRaw as Record<string, string>)
      .filter(([, href]) => href)
      .map(([platform, href]) => ({ platform, href }));
  }

  return siteConfigSchema.parse({
    name: raw.name ?? defaultSiteConfig.name,
    tagline: raw.tagline ?? defaultSiteConfig.tagline,
    branding: { ...defaultSiteConfig.branding, ...(raw.branding as object | undefined) },
    header: { ...defaultSiteConfig.header, ...(raw.header as object | undefined) },
    contact: {
      ...defaultSiteConfig.contact,
      ...(typeof raw.contact === "object" && raw.contact !== null ? (raw.contact as object) : {}),
      email:
        (raw.contact as { email?: string } | undefined)?.email ??
        (raw.email as string | undefined) ??
        "",
      phone:
        (raw.contact as { phone?: string } | undefined)?.phone ??
        (raw.phone as string | undefined) ??
        "",
      whatsapp:
        (raw.contact as { whatsapp?: string } | undefined)?.whatsapp ??
        (raw.whatsapp as string | undefined) ??
        "",
      address:
        (raw.contact as { address?: string } | undefined)?.address ??
        (raw.address as string | undefined) ??
        "",
    },
    social,
    features: { ...defaultSiteConfig.features, ...(raw.features as object | undefined) },
    email: { ...defaultSiteConfig.email, ...(raw.email as object | undefined) },
  });
}

/** Strip SMTP password before sending config to the admin UI. */
export function sanitizeSiteConfigForAdmin(site: SiteConfig): AdminSiteConfig {
  return {
    ...site,
    email: {
      ...site.email,
      smtpPass: "",
      smtpPassConfigured: Boolean(site.email.smtpPass?.trim()),
    },
  };
}

export function mergeSiteConfigPatch(current: SiteConfig, patch: Partial<SiteConfig>): SiteConfig {
  const merged = siteConfigSchema.parse({ ...current, ...patch });
  const patchEmail = patch.email;
  if (patchEmail && !patchEmail.smtpPass?.trim() && current.email.smtpPass?.trim()) {
    merged.email.smtpPass = current.email.smtpPass;
  }
  return merged;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: SITE_SETTING_KEY } });
    if (!row?.value || typeof row.value !== "object") return defaultSiteConfig;
    return migrateLegacySiteConfig(row.value as Record<string, unknown>);
  } catch {
    return defaultSiteConfig;
  }
}

export async function saveSiteConfig(config: SiteConfig): Promise<SiteConfig> {
  const parsed = siteConfigSchema.parse(config);
  await prisma.siteSetting.upsert({
    where: { key: SITE_SETTING_KEY },
    update: { value: parsed },
    create: { key: SITE_SETTING_KEY, value: parsed },
  });
  return parsed;
}

function toNavEditorItems(items: Array<{ id: string; label: string; url: string | null; children: Array<{ id: string; label: string; url: string | null }> }>): NavEditorItem[] {
  return items.map((item) => ({
    clientId: item.id,
    label: item.label,
    url: item.url ?? "",
    children: item.children.map((child) => ({
      clientId: child.id,
      label: child.label,
      url: child.url ?? "",
      children: [],
    })),
  }));
}

export async function getNavigationEditorItems(): Promise<NavEditorItem[]> {
  const menu = await prisma.menu.findUnique({
    where: { name: "main" },
    include: {
      items: {
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
        include: {
          children: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!menu?.items.length) {
    return [
      { clientId: "home", label: "Home", url: "/", children: [] },
      {
        clientId: "products",
        label: "Products",
        url: "/products/",
        children: [{ clientId: "massage-beds", label: "Massage Beds", url: "/massage-beds/", children: [] }],
      },
      { clientId: "about", label: "About", url: "/about/", children: [] },
      { clientId: "clients", label: "Clients", url: "/clients/", children: [] },
      { clientId: "brochure", label: "Brochure", url: "/brochure/", children: [] },
      { clientId: "blog", label: "Blog", url: "/blog/", children: [] },
      { clientId: "contact", label: "Contact", url: "/contact-us/", children: [] },
    ];
  }

  return toNavEditorItems(menu.items);
}

export async function saveNavigationItems(items: NavEditorItem[]): Promise<NavEditorItem[]> {
  const menu =
    (await prisma.menu.findUnique({ where: { name: "main" } })) ??
    (await prisma.menu.create({ data: { name: "main" } }));

  await prisma.$transaction(async (tx) => {
    await tx.menuItem.deleteMany({ where: { menuId: menu.id } });

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const parent = await tx.menuItem.create({
        data: {
          menuId: menu.id,
          label: item.label,
          url: item.url || null,
          sortOrder: i,
        },
      });

      for (let j = 0; j < item.children.length; j += 1) {
        const child = item.children[j];
        await tx.menuItem.create({
          data: {
            menuId: menu.id,
            parentId: parent.id,
            label: child.label,
            url: child.url || null,
            sortOrder: j,
          },
        });
      }
    }
  });

  return getNavigationEditorItems();
}

export async function getAdminSettingsEditorData(): Promise<AdminSettingsEditorData> {
  const [site, navigation, sitemapMeta, siteSchema] = await Promise.all([
    getSiteConfig(),
    getNavigationEditorItems(),
    getSitemapMeta(),
    getSiteSchemaSettings(),
  ]);
  return { site: sanitizeSiteConfigForAdmin(site), navigation, sitemapMeta, siteSchema };
}

export function navEditorToNavItems(items: NavEditorItem[]): NavItem[] {
  return items.map((item) => ({
    label: item.label,
    url: item.url,
    children: item.children.length
      ? item.children.map((child) => ({ label: child.label, url: child.url }))
      : undefined,
  }));
}
