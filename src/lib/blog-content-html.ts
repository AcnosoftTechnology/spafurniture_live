import { generateHTML, type JSONContent } from "@tiptap/core";
import { getBlogEditorExtensions } from "@/lib/tiptap-blog-extensions";

export function isTipTapDoc(value: unknown): value is JSONContent {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (value as { type?: string }).type === "doc"
  );
}

/** Normalize stored blog `content` (HTML string or legacy TipTap JSON) to HTML. */
export function blogContentToHtml(content: unknown): string {
  if (content == null) return "";
  if (typeof content === "string") return content;
  if (isTipTapDoc(content)) {
    try {
      return generateHTML(content, getBlogEditorExtensions({ flexibleListItems: true }));
    } catch {
      return "";
    }
  }
  return "";
}
