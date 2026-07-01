import { ParallaxSectionBg } from "@/components/site/home/parallax-section-bg";
import { mediaUrl } from "@/lib/utils";
import type { HomepageContent } from "@/features/homepage/schemas/homepage-content.schema";

export function HeroBanner({ hero }: { hero: HomepageContent["hero"] }) {
  return (
    <section className="esth-premium-banner" id="home">
      <ParallaxSectionBg
        className="esth-premium-banner-bg"
        imageUrl="/assets/images/bg/perfection.png"
        maxShift={165}
        parallaxScale={1}
      />
      <div className=" esth-premium-banner-shell">
        <div className="esth-premium-banner-inner">
          <div className="esth-premium-image">
            <img src={mediaUrl(hero.imagePath)} alt={hero.alt} />
          </div>
        </div>
      </div>
    </section>
  );
}
