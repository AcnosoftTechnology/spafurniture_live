import Image from "next/image";
import { mediaUrl } from "@/lib/utils";
import { SocialPlatformIcon } from "@/components/site/social-platform-icon";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import { BackToTopButton } from "@/components/site/layout/back-to-top-button";
import type { SiteConfig } from "@/features/settings/schemas/site-config.schema";
import type { HomepageContent } from "@/features/homepage/schemas/homepage-content.schema";

function certificationHasLink(href?: string) {
  const trimmed = href?.trim();
  return Boolean(trimmed && trimmed !== "#");
}

export function EsthFooter({ site, footer }: { site: SiteConfig; footer: HomepageContent["footer"] }) {
  const footerLogo = site.branding.footerLogoPath || footer.miniLogoPath;
  const socialLinks = site.social.length ? site.social : footer.social;

  return (
<footer className="esth-footer-wrap" id="contact">
  <BackToTopButton />

  <div className="esth-footer-main">
    <EsthPageShell>
      {/* CHANGED HERE */}
      <div className="esth-cert-row grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-[repeat(8,minmax(0,1fr))]">
        {footer.certifications.map((item, index) => {
          const image = (
            <Image
              src={mediaUrl(item.imagePath)}
              alt={item.alt ?? `Certification ${index + 1}`}
              width={115}
              height={80}
              sizes="115px"
              className="esth-cert-box-img w-full max-w-[115px] h-auto object-contain"
            />
          );

          return (
            <div
              key={`${item.imagePath}-${index}`}
              className="esth-cert-box flex items-center justify-center"
            >
              {certificationHasLink(item.href) ? (
                <a
                  href={item.href!.trim()}
                  {...(item.openInNewTab
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {image}
                </a>
              ) : (
                image
              )}
            </div>
          );
        })}
      </div>
    </EsthPageShell>

    <EsthPageShell>
      <div className="esth-footer-content">
        <div className="esth-mini-logo">
          <Image
            src={mediaUrl(footerLogo)}
            alt="Footer logo"
            width={220}
            height={80}
            className="mx-auto h-auto max-w-[220px]"
          />
        </div>

        <h2>Reach us today</h2>

        <div className="esth-footer-contact">
          {site.contact.email ? (
            <a href={`mailto:${site.contact.email}`}>
              {site.contact.email.toUpperCase()}
            </a>
          ) : null}

          {site.contact.email && site.contact.phone ? <span>/</span> : null}

          {site.contact.phone ? (
            <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`}>
              {site.contact.phone}
            </a>
          ) : null}
        </div>

        <p>{footer.tagline}</p>

        <div className="esth-footer-social">
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.href}
              aria-label={link.platform}
              target="_blank"
              rel="noopener noreferrer"
              title={link.platform}
            >
              <SocialPlatformIcon
                platform={link.platform}
                className="esth-footer-social-icon"
              />
            </a>
          ))}
        </div>
      </div>
    </EsthPageShell>
  </div>

  <div className="esth-footer-bar">
    <EsthPageShell className="esth-footer-bar-inner">
      <p className="esth-footer-copy">
        © Esthetica Spa and Salon Resources Pvt. Ltd. All rights reserved.
      </p>

      <p className="esth-footer-credit">
        Website managed by{" "}
        <a
          href="https://acnosoft.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Acnosoft technology
        </a>
      </p>
    </EsthPageShell>
  </div>
</footer>
  );
}
