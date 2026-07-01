/** Extract plain text from TipTap JSON for meta description auto-fill */

type TiptapNode = {
  type?: string;
  text?: string;
  content?: TiptapNode[];
};

export function tiptapToPlainText(doc: unknown, maxLength = 500): string {
  if (!doc || typeof doc !== "object") return "";
  const root = doc as TiptapNode;
  const parts: string[] = [];

  function walk(node: TiptapNode) {
    if (node.text) parts.push(node.text);
    node.content?.forEach(walk);
  }

  walk(root);
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  if (maxLength > 0 && text.length > maxLength) {
    return `${text.slice(0, maxLength).trim()}…`;
  }
  return text;
}
