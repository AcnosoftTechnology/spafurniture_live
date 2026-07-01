import type { BrochurePageData } from "@/features/brochure/get-brochure-data";
import { sanitizeBrochureEmbed } from "@/lib/sanitize-html";
import { mediaUrl } from "@/lib/utils";

export function BrochurePageView({ data }: { data: BrochurePageData }) {
  const { content, pdf } = data;
  const downloadHref = pdf ? mediaUrl(pdf.path) : null;
  const embedHtml = sanitizeBrochureEmbed(content.embedHtml);

  return (
    <main className="esth-brochure-page">
      {embedHtml ? (
        <section
          className="esth-brochure-viewer"
          aria-label="Digital brochure"
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
      ) : null}

      {downloadHref ? (
        <div className="esth-brochure-download-wrap">
          <a
            href={downloadHref}
            download={pdf?.filename || "esthetica-brochure.pdf"}
            className="esth-brochure-download-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            {content.downloadLabel}
          </a>
        </div>
      ) : null}
    </main>
  );
}
