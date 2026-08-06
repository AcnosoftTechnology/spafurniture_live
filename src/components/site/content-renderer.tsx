import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { blogContentToHtml, isTipTapDoc } from "@/lib/blog-content-html";

export function ContentRenderer({
  content,
  className = "prose prose-stone max-w-none",
}: {
  content: unknown;
  className?: string;
}) {
  if (!content) return null;

  const html =
    typeof content === "string" || isTipTapDoc(content)
      ? blogContentToHtml(content)
      : "";

  if (!html.trim()) return null;

  let safe = "";
  try {
    safe = sanitizeRichHtml(html);
  } catch {
    return null;
  }
  if (!safe.trim()) return null;

  return <div className={className} dangerouslySetInnerHTML={{ __html: safe }} />;
}
