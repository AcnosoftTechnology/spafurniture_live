import type { ClientSection } from "@/features/clients/schemas/clients-content.schema";

function parseLines(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Serialize sections for the admin textarea (||| = column split, --- = section divider). */
export function sectionsToEditableText(sections: ClientSection[]): string {
  return sections
    .map((section) => {
      if (!section.right.length) return section.left.join("\n");
      return `${section.left.join("\n")}\n|||\n${section.right.join("\n")}`;
    })
    .join("\n---\n");
}

/** Parse admin textarea back into left/right columns. */
export function editableTextToSections(text: string): ClientSection[] {
  const blocks = text
    .split(/\n\s*---\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (!blocks.length && text.trim()) {
    blocks.push(text.trim());
  }

  return blocks.map((block) => {
    if (block.includes("|||")) {
      const [leftPart, ...rest] = block.split(/\n\s*\|\|\|\s*\n/);
      return {
        left: parseLines(leftPart),
        right: parseLines(rest.join("\n")),
      };
    }
    const lines = parseLines(block);
    const mid = Math.ceil(lines.length / 2);
    return { left: lines.slice(0, mid), right: lines.slice(mid) };
  });
}

export function countClientNames(sections: ClientSection[]): number {
  return sections.reduce((n, s) => n + s.left.length + s.right.length, 0);
}
