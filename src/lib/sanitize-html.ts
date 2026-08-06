import sanitizeHtml from "sanitize-html";

const defaultOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    "img",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "figure",
    "figcaption",
    "video",
    "source",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "caption",
    "colgroup",
    "col",
    "span",
    "div",
    "u",
    "s",
    "sup",
    "sub",
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height", "class"],
    a: ["href", "name", "target", "rel", "class"],
    video: ["src", "controls", "width", "height"],
    source: ["src", "type"],
    table: ["class", "style", "border", "cellpadding", "cellspacing", "width", "align"],
    thead: ["class", "style"],
    tbody: ["class", "style"],
    tfoot: ["class", "style"],
    tr: ["class", "style"],
    th: ["class", "style", "colspan", "rowspan", "width", "align", "scope"],
    td: ["class", "style", "colspan", "rowspan", "width", "align"],
    col: ["span", "width", "style"],
    colgroup: ["span", "style"],
    p: ["class", "style"],
    span: ["class", "style"],
    div: ["class", "style"],
    h1: ["class", "style"],
    h2: ["class", "style"],
    h3: ["class", "style"],
    h4: ["class", "style"],
    h5: ["class", "style"],
    h6: ["class", "style"],
    ul: ["class", "style"],
    ol: ["class", "style", "start", "type"],
    li: ["class", "style"],
    blockquote: ["class", "style"],
  },
  allowedStyles: {
    "*": {
      "text-align": [/^left$/i, /^right$/i, /^center$/i, /^justify$/i],
      "font-weight": [/^bold$/i, /^normal$/i, /^[1-9]00$/],
      "font-style": [/^italic$/i, /^normal$/i],
      "text-decoration": [/^underline$/i, /^line-through$/i, /^none$/i],
      width: [/^\d+(?:\.\d+)?(?:px|%|em|rem)$/],
      height: [/^\d+(?:\.\d+)?(?:px|%|em|rem)$/],
      "max-width": [/^\d+(?:\.\d+)?(?:px|%|em|rem)$/],
      "vertical-align": [/^top$/i, /^middle$/i, /^bottom$/i, /^baseline$/i],
      "background-color": [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
      color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
      "border-width": [/^\d+(?:\.\d+)?px$/],
      "border-style": [/^solid$/i, /^none$/i, /^dashed$/i, /^dotted$/i],
      "border-color": [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
      padding: [/^\d+(?:\.\d+)?(?:px|em|rem)(?:\s+\d+(?:\.\d+)?(?:px|em|rem)){0,3}$/],
      margin: [/^\d+(?:\.\d+)?(?:px|em|rem)(?:\s+\d+(?:\.\d+)?(?:px|em|rem)){0,3}$/],
    },
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
