import { z } from "zod";

export const siteBrandingSchema = z.object({
  siteLogoPath: z.string().default("/assets/images/header/Spa-furniture-logo-2.png"),
  siteLogoMediaId: z.string().nullable().optional(),
  faviconPath: z.string().default(""),
  faviconMediaId: z.string().nullable().optional(),
  adminLogoPath: z.string().default(""),
  adminLogoMediaId: z.string().nullable().optional(),
  shippingLogoPath: z.string().default("/assets/images/header/World-Wide-Shipping-Logo.png"),
  shippingLogoMediaId: z.string().nullable().optional(),
  footerLogoPath: z.string().default("/assets/images/footer/logo-footer.png"),
  footerLogoMediaId: z.string().nullable().optional(),
});

export const siteEmailSchema = z.object({
  enabled: z.boolean().default(false),
  smtpHost: z.string().default(""),
  smtpPort: z.coerce.number().int().min(1).max(65535).default(587),
  smtpSecure: z.boolean().default(false),
  smtpUser: z.string().default(""),
  smtpPass: z.string().default(""),
  fromEmail: z.string().default(""),
  fromName: z.string().default(""),
  /** Comma-separated admin inboxes for enquiry notifications */
  adminEmails: z.string().default(""),
  /** Comma-separated CC addresses for enquiry notifications */
  ccEmails: z.string().default(""),
  sendUserThankYou: z.boolean().default(true),
  sendAdminNotification: z.boolean().default(true),
});

export type SiteEmailSettings = z.infer<typeof siteEmailSchema>;

export const defaultSiteEmailSettings: SiteEmailSettings = {
  enabled: false,
  smtpHost: "",
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: "",
  smtpPass: "",
  fromEmail: "",
  fromName: "Esthetica Spa Furniture",
  adminEmails: "",
  ccEmails: "",
  sendUserThankYou: true,
  sendAdminNotification: true,
};

export const siteConfigSchema = z.object({
  name: z.string().default("Esthetica Spa Furniture"),
  tagline: z.string().default("Premium spa & salon furniture"),
  branding: siteBrandingSchema,
  email: siteEmailSchema.default(defaultSiteEmailSettings),
  header: z.object({
    exploreCtaLabel: z.string().default("Explore Our Products"),
    exploreCtaHref: z.string().default("/products/"),
  }),
  contact: z.object({
    businessName: z.string().default("ESTHETICA SPA AND SALON RESOURCES PVT. LTD"),
    email: z.string().default(""),
    phone: z.string().default(""),
    whatsapp: z.string().default(""),
    address: z.string().default(""),
  }),
  social: z
    .array(
      z.object({
        platform: z.string(),
        href: z.string(),
      }),
    )
    .default([]),
  features: z
    .object({
      blogComments: z.boolean().default(true),
      productReviews: z.boolean().default(true),
    })
    .default({ blogComments: true, productReviews: true }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type SiteBranding = z.infer<typeof siteBrandingSchema>;

export const defaultSiteConfig: SiteConfig = {
  name: "Esthetica Spa Furniture",
  tagline: "Premium spa & salon furniture",
  branding: {
    siteLogoPath: "/assets/images/header/Spa-furniture-logo-2.png",
    faviconPath: "",
    adminLogoPath: "",
    shippingLogoPath: "/assets/images/header/World-Wide-Shipping-Logo.png",
    footerLogoPath: "/assets/images/footer/logo-footer.png",
  },
  header: {
    exploreCtaLabel: "Explore Our Products",
    exploreCtaHref: "/products/",
  },
  contact: {
    businessName: "ESTHETICA SPA AND SALON RESOURCES PVT. LTD",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
  },
  social: [],
  features: { blogComments: true, productReviews: true },
  email: defaultSiteEmailSettings,
};

export const SITE_SETTING_KEY = "site";
