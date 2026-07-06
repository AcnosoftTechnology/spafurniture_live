import sanitizeHtml from "sanitize-html";

const defaultOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    "img",
    "h1",
    "h2",
    "h3",
    "h4",
    "figure",
    "figcaption",
    "video",
    "source",
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height"],
    a: ["href", "name", "target", "rel"],
    video: ["src", "controls", "width", "height"],
    source: ["src", "type"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

const brochureEmbedOptions: sanitizeHtml.IOptions = {
  allowedTags: ["div", "iframe"],
  allowedAttributes: {
    div: ["style", "class"],
    iframe: [
      "src",
      "title",
      "width",
      "height",
      "style",
      "class",
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "loading",
      "referrerpolicy",
      "sandbox",
    ],
  },
  allowedSchemes: ["http", "https"],
  allowVulnerableTags: true,
};

export function sanitizeRichHtml(html: string): string {
  return sanitizeHtml(html, defaultOptions);
}

const regionalIntroOptions: sanitizeHtml.IOptions = {
  ...defaultOptions,
  allowedAttributes: {
    ...defaultOptions.allowedAttributes,
    div: ["class", "style"],
    h2: ["class"],
    h3: ["class"],
    h4: ["class"],
    p: ["class"],
    strong: [],
    em: [],
    ul: ["class"],
    ol: ["class"],
    li: ["class"],
  },
};

/** Regional intro copy — allows grid shortcode output (div class/style). */
export function sanitizeRegionalIntroHtml(html: string): string {
  return sanitizeHtml(html, regionalIntroOptions);
}

/** Issuu / brochure iframe embed code from admin (iframe + optional wrapper div only). */
export function sanitizeBrochureEmbed(html: string): string {
  return sanitizeHtml(html.trim(), brochureEmbedOptions);
}
