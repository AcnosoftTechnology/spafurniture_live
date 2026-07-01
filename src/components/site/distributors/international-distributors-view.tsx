import { InquiryForm } from "@/components/site/inquiry-form";
import { ContactSocialLinks } from "@/components/site/contact/contact-social-links";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import {
  DISTRIBUTORS_CTA,
  DISTRIBUTOR_REGIONS,
} from "@/features/distributors/distributors-content";

type InternationalDistributorsViewProps = {
  socialLinks: Array<{ platform: string; href: string }>;
};

const DISTRIBUTOR_SOCIAL = ["facebook", "instagram", "linkedin"];

function filterDistributorSocial(links: Array<{ platform: string; href: string }>) {
  return links.filter((link) =>
    DISTRIBUTOR_SOCIAL.some((key) => link.platform.toLowerCase().includes(key)),
  );
}

export function InternationalDistributorsView({ socialLinks }: InternationalDistributorsViewProps) {
  const social = filterDistributorSocial(socialLinks);

  return (
    <main className="esth-contact-page esth-distributors-page">
      <EsthPageShell className="esth-contact-shell">
        <header className="esth-contact-header">
          <p className="esth-contact-eyebrow">Contact Us</p>
          <h1 className="esth-contact-title">Get in Touch</h1>
          <p className="esth-contact-intro">
            If you want to get in touch with our Local Distributor in your country then do not
            hesitate to contact us by submitting the form below.
          </p>
        </header>

        <div className="esth-contact-grid">
          <div className="esth-contact-form-col">
            <InquiryForm type="CONTACT" variant="distributors-page" />
          </div>

          <aside className="esth-contact-info-col esth-distributors-info" aria-label="Distributor regions">
            <h2 className="esth-distributors-heading">We have Distributors in</h2>

            <ul className="esth-distributors-list">
              {DISTRIBUTOR_REGIONS.map((region) => (
                <li key={region}>{region}</li>
              ))}
            </ul>

            <p className="esth-distributors-cta">{DISTRIBUTORS_CTA}</p>

            {social.length > 0 ? (
              <div className="esth-contact-social-block">
                <h2 className="esth-contact-social-title">Follow Us</h2>
                <ContactSocialLinks links={social} />
              </div>
            ) : null}
          </aside>
        </div>
      </EsthPageShell>
    </main>
  );
}
