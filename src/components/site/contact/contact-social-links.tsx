import { SocialPlatformIcon } from "@/components/site/social-platform-icon";

type SocialLink = { platform: string; href: string };

export function ContactSocialLinks({ links }: { links: SocialLink[] }) {
  return (
    <ul className="esth-contact-social-list">
      {links.map((link) => (
        <li key={`${link.platform}-${link.href}`}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.platform}
            className="esth-contact-social-link"
          >
            <SocialPlatformIcon platform={link.platform} className="esth-contact-social-icon" />
          </a>
        </li>
      ))}
    </ul>
  );
}
