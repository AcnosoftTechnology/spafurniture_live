import Image from "next/image";
import { ParallaxSectionBg } from "@/components/site/home/parallax-section-bg";
import { mediaUrl } from "@/lib/utils";
import { EsthContainer } from "@/components/site/layout/esth-container";
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from "@/components/site/motion/scroll-reveal";
import type { HomepageContent } from "@/features/homepage/schemas/homepage-content.schema";

export function SpecialitySection({ data }: { data: HomepageContent["speciality"] }) {
  return (
    <section className="esth-speciality-section">
      <ParallaxSectionBg
        className="esth-speciality-bg"
        imageUrl="/assets/images/speciality/bg-special.jpg"
        parallaxScale={1}
        revealOffset={150}
        revealDistance={400}
        revealEndShift={90}
      />
      <EsthContainer className="esth-speciality-content">
        <ScrollReveal className="esth-speciality-heading">
          <span>{data.tag}</span>
          <h2>{data.title}</h2>
          <p>{data.description}</p>
        </ScrollReveal>
      </EsthContainer>
      <ScrollRevealStagger className="esth-speciality-bottom-row">
        {data.cards.map((card) => (
          <ScrollRevealItem key={card.title} className="esth-speciality-box">
            <Image
              src={mediaUrl(card.imagePath)}
              alt={card.title}
              width={108}
              height={108}
              sizes="108px"
              className="esth-speciality-icon"
            />
            <h3>{card.title}</h3>
          </ScrollRevealItem>
        ))}
      </ScrollRevealStagger>
    </section>
  );
}
