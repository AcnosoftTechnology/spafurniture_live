import Link from "next/link";
import { AboutGalleryCarousel } from "@/components/site/about/about-gallery-carousel";
import { AboutTeamBannerSlider } from "@/components/site/about/about-team-banner-slider";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import { mediaUrl } from "@/lib/utils";
import type { AboutContent } from "@/features/about/schemas/about-content.schema";

function AboutParagraph({ text }: { text: string }) {
  if (text.includes("<")) {
    return <p className="esth-about-body-p" dangerouslySetInnerHTML={{ __html: text }} />;
  }
  return <p className="esth-about-body-p">{text}</p>;
}

export function AboutPageView({ content }: { content: AboutContent }) {
  const ctaBg = content.cta.backgroundImagePath ? mediaUrl(content.cta.backgroundImagePath) : "";

  return (
    <main className="esth-about-page">
      <EsthPageShell className="esth-about-intro-shell">
        <header className="esth-about-intro">
          <p className="esth-about-eyebrow">{content.intro.eyebrow}</p>
          <h1 className="esth-about-title">{content.intro.title}</h1>
          <p className="esth-about-intro-body">{content.intro.body}</p>
        </header>
      </EsthPageShell>

      <AboutTeamBannerSlider banner={content.teamBanner} />

      <EsthPageShell className="esth-about-body-shell">
        <h2 className="esth-about-subheading">{content.body.subheading}</h2>

        <div className="esth-about-body">
          {content.body.paragraphs.map((paragraph, index) => (
            <AboutParagraph key={index} text={paragraph} />
          ))}
        </div>

        {content.body.gallery.length > 0 ? (
          <AboutGalleryCarousel items={content.body.gallery} />
        ) : null}
      </EsthPageShell>

      <section
        className="esth-about-cta"
        style={ctaBg ? { ["--esth-about-cta-bg" as string]: `url(${ctaBg})` } : undefined}
      >
        <EsthPageShell className="esth-about-cta-inner">
          <p className="esth-about-cta-text">{content.cta.text}</p>
          <Link href={content.cta.buttonHref} className="esth-about-cta-btn">
            {content.cta.buttonLabel}
          </Link>
        </EsthPageShell>
      </section>
    </main>
  );
}
