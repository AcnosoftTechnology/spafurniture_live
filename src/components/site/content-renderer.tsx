import { sanitizeRichHtml } from "@/lib/sanitize-html";

type ContentDoc = {
  type?: string;
  content?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

export function ContentRenderer({
  content,
  className = "prose prose-stone max-w-none",
}: {
  content: unknown;
  className?: string;
}) {
  if (!content) return null;

  if (typeof content === "string") {
    let html = "";
    try {
      html = sanitizeRichHtml(content);
    } catch {
      return null;
    }
    if (!html.trim()) return null;
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const doc = content as ContentDoc;
  if (doc.type === "doc" && doc.content) {
    return (
      <div className={className}>
        {doc.content.map((node, i) => {
          if (node.type === "paragraph") {
            const text = node.content?.map((c) => c.text).join("") ?? "";
            if (!text.trim()) return null;
            return <p key={i}>{text}</p>;
          }
          return null;
        })}
      </div>
    );
  }

  return null;
}
