import { z } from "zod";

export const DEFAULT_ISSUU_EMBED_URL =
  "https://e.issuu.com/embed.html?d=esthetica_spa_furniture_brochure_2026&u=estheticaspafurnitureindia";

export const DEFAULT_BROCHURE_EMBED_HTML = `<div style="position:relative;padding-top:max(60%,324px);height:0;width:100%"><iframe allow="clipboard-write" sandbox="allow-top-navigation allow-top-navigation-by-user-activation allow-downloads allow-scripts allow-same-origin allow-popups allow-modals allow-popups-to-escape-sandbox allow-forms" allowfullscreen="true" style="position:absolute;border:none;width:100%;height:100%;left:0;right:0;top:0;bottom:0;" src="${DEFAULT_ISSUU_EMBED_URL}" title="Esthetica spa furniture brochure"></iframe></div>`;

const brochurePageBaseSchema = z.object({
  embedHtml: z.string().default(""),
  /** @deprecated Legacy — migrated to embedHtml on read */
  issuuEmbedUrl: z.string().optional(),
  downloadLabel: z.string().default("Download Brochure"),
  pdfMediaId: z.string().nullable().optional(),
});

export const brochurePageSchema = brochurePageBaseSchema.transform((data) => {
  const embedHtml = data.embedHtml?.trim();
  if (embedHtml) return { ...data, embedHtml };

  const legacyUrl = data.issuuEmbedUrl?.trim();
  if (legacyUrl) {
    return {
      ...data,
      embedHtml: `<iframe src="${legacyUrl}" title="Esthetica spa furniture brochure" style="width:100%;height:min(85vh,720px);min-height:480px;border:0;" allowfullscreen allow="clipboard-write; fullscreen"></iframe>`,
    };
  }

  return { ...data, embedHtml: DEFAULT_BROCHURE_EMBED_HTML };
});

export type BrochurePageContent = z.infer<typeof brochurePageBaseSchema> & { embedHtml: string };

export const defaultBrochurePageContent: BrochurePageContent = brochurePageSchema.parse({
  embedHtml: DEFAULT_BROCHURE_EMBED_HTML,
  downloadLabel: "Download Brochure",
  pdfMediaId: null,
});

export const BROCHURE_SETTING_KEY = "brochure";
