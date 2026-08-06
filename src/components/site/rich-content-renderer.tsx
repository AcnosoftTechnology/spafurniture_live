import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { splitContentByAccordions } from "@/lib/faq-shortcode";
import { FaqAccordionBlock } from "@/components/site/faq-accordion-block";
import { ContentRenderer } from "@/components/site/content-renderer";
import { blogContentToHtml, isTipTapDoc } from "@/lib/blog-content-html";

export async function RichContentRenderer({
  content,
  className = "prose prose-stone max-w-none",
}: {
  content: unknown;
  className?: string;
}) {
  if (!content) return null;

  const asHtml =
    typeof content === "string"
      ? content
      : isTipTapDoc(content)
        ? blogContentToHtml(content)
        : null;

  if (asHtml == null) {
    return <ContentRenderer content={content} className={className} />;
  }

  const parts = splitContentByAccordions(asHtml);
  const hasAccordion = parts.some((p) => p.type === "accordion");

  if (!hasAccordion) {
    return <ContentRenderer content={asHtml} className={className} />;
  }

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.type === "accordion") {
          return <FaqAccordionBlock key={`faq-${part.shortcodeId}-${index}`} shortcodeId={part.shortcodeId} />;
        }
        const html = sanitizeRichHtml(part.html);
        if (!html.trim()) return null;
        return (
          <div
            key={`html-${index}`}
            className="esth-rich-html-block"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}
