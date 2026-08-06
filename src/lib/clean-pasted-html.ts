/**
 * Clean Word / Google Docs / Office clipboard HTML into semantic tags
 * TipTap and the front-end can keep (headings, lists, tables, bold, etc.).
 */
export function cleanPastedHtml(html: string): string {
  if (!html.trim()) return html;

  let out = html;

  // Strip Word conditional comments and XML namespaces
  out = out.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "");
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  out = out.replace(/<\/?(?:xml|o|v|w):[^>]*>/gi, "");

  // Drop Word/Office wrapper chrome
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(/<meta[^>]*>/gi, "");
  out = out.replace(/<link[^>]*>/gi, "");
  out = out.replace(/<\/?html[^>]*>/gi, "");
  out = out.replace(/<\/?head[^>]*>/gi, "");
  out = out.replace(/<\/?body[^>]*>/gi, "");
  out = out.replace(/<o:p>\s*<\/o:p>/gi, "");
  out = out.replace(/<\/?o:p[^>]*>/gi, "");

  // Convert common Word inline emphasis to semantic tags
  out = out.replace(
    /<span[^>]*style="[^"]*font-weight\s*:\s*bold[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    "<strong>$1</strong>",
  );
  out = out.replace(
    /<span[^>]*style="[^"]*font-style\s*:\s*italic[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    "<em>$1</em>",
  );
  out = out.replace(
    /<span[^>]*style="[^"]*text-decoration\s*:\s*underline[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    "<u>$1</u>",
  );

  // Unwrap empty / MsoNormal-only spans that only wrap text
  out = out.replace(/<span[^>]*class="[^"]*Mso[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, "$1");
  out = out.replace(/<span[^>]*lang="[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, "$1");

  // Normalize deprecated tags
  out = out.replace(/<\/?b\b[^>]*>/gi, (tag) => (tag.startsWith("</") ? "</strong>" : "<strong>"));
  out = out.replace(/<\/?i\b[^>]*>/gi, (tag) => (tag.startsWith("</") ? "</em>" : "<em>"));

  // Strip mso-* classes and empty class/style attrs clutter
  out = out.replace(/\sclass="[^"]*Mso[^"]*"/gi, "");
  out = out.replace(/\sclass=''/gi, "");
  out = out.replace(/\sstyle="[^"]*mso-[^"]*"/gi, (match) => {
    const cleaned = match
      .replace(/mso-[^;"]+;?/gi, "")
      .replace(/:\s*;/g, ":")
      .replace(/style="\s*"/i, "");
    return /style="/i.test(cleaned) && !/style="\s*"/i.test(cleaned) ? cleaned : "";
  });

  // Collapse leftover empty spans
  out = out.replace(/<span(?:\s[^>]*)?>\s*<\/span>/gi, "");
  out = out.replace(/<span(?:\s[^>]*)?>([\s\S]*?)<\/span>/gi, "$1");

  // Word often pastes &nbsp; runs
  out = out.replace(/(&nbsp;|\u00a0){2,}/g, " ");

  return out.trim();
}
