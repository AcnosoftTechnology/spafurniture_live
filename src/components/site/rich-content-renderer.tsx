import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { splitContentByAccordions } from "@/lib/faq-shortcode";
import { FaqAccordionBlock } from "@/components/site/faq-accordion-block";
import { ContentRenderer } from "@/components/site/content-renderer";

type ContentDoc = {
  type?: string;
  content?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

export async function RichContentRenderer({
  content,
  className = "prose prose-stone max-w-none",
}: {
  content: unknown;
  className?: string;
}) {
  if (!content) return null;

  if (typeof content === "string") {
    const parts = splitContentByAccordions(content);
    const hasAccordion = parts.some((p) => p.type === "accordion");

    if (!hasAccordion) {
      return <ContentRenderer content={content} className={className} />;
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

  return <ContentRenderer content={content} className={className} />;
}
