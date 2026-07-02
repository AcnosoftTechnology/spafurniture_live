import { InquiryForm } from "@/components/site/inquiry-form";
import { ContactSocialLinks } from "@/components/site/contact/contact-social-links";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import type { DistributorsPageContent } from "@/features/distributors/schemas/distributors-content.schema";
import { sanitizeRichHtml } from "@/lib/sanitize-html";

type InternationalDistributorsViewProps = {
  content: DistributorsPageContent;
  socialLinks: Array<{ platform: string; href: string }>;
};

const DISTRIBUTOR_SOCIAL = ["facebook", "instagram", "linkedin"];

function filterDistributorSocial(links: Array<{ platform: string; href: string }>) {
  return links.filter((link) =>
    DISTRIBUTOR_SOCIAL.some((key) => link.platform.toLowerCase().includes(key)),
  );
}

export function InternationalDistributorsView({
  content,
  socialLinks,
}: InternationalDistributorsViewProps) {
  const social = filterDistributorSocial(socialLinks);
  const { intro, sidebar } = content;

  return (
    <main className="esth-contact-page esth-distributors-page">
      <EsthPageShell className="esth-contact-shell">
        <header className="esth-contact-header">
          {intro.eyebrow ? <p className="esth-contact-eyebrow">{intro.eyebrow}</p> : null}
          <h1 className="esth-contact-title">{intro.title}</h1>
          {intro.body ? (
            <div
              className="esth-contact-intro esth-distributors-html"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(intro.body) }}
            />
          ) : null}
        </header>

        <div className="esth-contact-grid">
          <div className="esth-contact-form-col">
            <InquiryForm type="CONTACT" variant="distributors-page" />
          </div>

          <aside className="esth-contact-info-col esth-distributors-info" aria-label="Distributor regions">
            <h2 className="esth-distributors-heading">{sidebar.heading}</h2>

            {sidebar.regionsHtml ? (
              <div
                className="esth-distributors-html esth-distributors-regions-html"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(sidebar.regionsHtml) }}
              />
            ) : null}

            {sidebar.ctaHtml ? (
              <div
                className="esth-distributors-html esth-distributors-cta"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(sidebar.ctaHtml) }}
              />
            ) : null}

            {social.length > 0 ? (
              <div className="esth-contact-social-block">
                <h2 className="esth-contact-social-title">{sidebar.socialTitle || "Follow Us"}</h2>
                <ContactSocialLinks links={social} />
              </div>
            ) : null}
          </aside>
        </div>
      </EsthPageShell>
    </main>
  );
}
