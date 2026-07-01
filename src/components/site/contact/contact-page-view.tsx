import { Mail } from "lucide-react";
import { InquiryForm } from "@/components/site/inquiry-form";
import { ContactGoogleMap } from "@/components/site/contact/contact-google-map";
import { ContactSocialLinks } from "@/components/site/contact/contact-social-links";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import { defaultSiteConfig, type SiteConfig } from "@/features/settings/schemas/site-config.schema";

const DEFAULT_ADDRESS =
  "Plot No. 249, Sector 6, IMT Manesar, Gurgaon-122050, Haryana, India";

type ContactPageViewProps = {
  site: SiteConfig;
  socialLinks: Array<{ platform: string; href: string }>;
};

const CONTACT_SOCIAL = ["facebook", "instagram", "linkedin"];

function filterContactSocial(links: Array<{ platform: string; href: string }>) {
  return links.filter((link) =>
    CONTACT_SOCIAL.some((key) => link.platform.toLowerCase().includes(key)),
  );
}

export function ContactPageView({ site, socialLinks }: ContactPageViewProps) {
  const businessName =
    site.contact.businessName?.trim() || defaultSiteConfig.contact.businessName;
  const address = site.contact.address?.trim() || DEFAULT_ADDRESS;
  const email = site.contact.email?.trim() || "info@spafurniture.in";
  const phone = site.contact.phone?.trim() || "+91-124-4003120, 4035516, +91-9873144051";
  const social = filterContactSocial(socialLinks);

  return (
    <main className="esth-contact-page">
      <EsthPageShell className="esth-contact-shell">
        <header className="esth-contact-header">
          <p className="esth-contact-eyebrow">Contact Us</p>
          <h1 className="esth-contact-title">Get in Touch</h1>
          <p className="esth-contact-intro">
            If you have any questions, don&apos;t hesitate to contact us by submitting the form below.
          </p>
        </header>

        <div className="esth-contact-grid">
          <div className="esth-contact-form-col">
            <InquiryForm type="CONTACT" variant="contact-page" />
          </div>

          <aside className="esth-contact-info-col" aria-label="Contact information">
            <p className="esth-contact-company">{businessName}</p>

            <p className="esth-contact-address">{address}</p>

            <p className="esth-contact-line">
              <Mail className="esth-contact-line-icon" aria-hidden />
              <a href={`mailto:${email}`}>{email}</a>
            </p>

            <p className="esth-contact-phone">{phone}</p>

            {social.length > 0 ? (
              <div className="esth-contact-social-block">
                <h2 className="esth-contact-social-title">Follow Us</h2>
                <ContactSocialLinks links={social} />
              </div>
            ) : null}
          </aside>
        </div>
      </EsthPageShell>

      <ContactGoogleMap address={address} businessName={businessName} />
    </main>
  );
}
