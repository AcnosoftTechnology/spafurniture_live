/** WordPress Smart Post Show / Easy Accordion shortcode (legacy). */
export const SP_EASY_ACCORDION_REGEX =
  /\[sp_easyaccordion\s+id=["']?(\d+)["']?\s*\]/gi;

export function formatSpEasyAccordionShortcode(shortcodeId: number): string {
  return `[sp_easyaccordion id="${shortcodeId}"]`;
}

export function extractSpEasyAccordionIds(html: string): number[] {
  const ids = new Set<number>();
  const re = new RegExp(SP_EASY_ACCORDION_REGEX.source, "gi");
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const id = Number.parseInt(match[1], 10);
    if (Number.isFinite(id)) ids.add(id);
  }
  return [...ids];
}

export type ContentPart =
  | { type: "html"; html: string }
  | { type: "accordion"; shortcodeId: number };

export function splitContentByAccordions(html: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const re = new RegExp(SP_EASY_ACCORDION_REGEX.source, "gi");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(html)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "html", html: html.slice(lastIndex, match.index) });
    }
    parts.push({ type: "accordion", shortcodeId: Number.parseInt(match[1], 10) });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < html.length) {
    parts.push({ type: "html", html: html.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: "html", html }];
}
