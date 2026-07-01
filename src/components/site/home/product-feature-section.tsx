import Image from "next/image";
import { SectionButton } from "@/components/site/home/section-button";
import { EsthContainer } from "@/components/site/layout/esth-container";
import { ScrollRevealItem, ScrollRevealStagger } from "@/components/site/motion/scroll-reveal";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { mediaUrl } from "@/lib/utils";
import type { HomepageCategoryFeature } from "@/features/homepage/get-homepage-data";

export function ProductFeatureSection({
  category,
  reverse = false,
  showBottomLine = true,
}: {
  category: HomepageCategoryFeature;
  reverse?: boolean;
  showBottomLine?: boolean;
}) {
  const imagePath = mediaUrl(category.imagePath ?? "/assets/images/furniture/11.png");
  const bgImagePath = mediaUrl(
    category.homepageFeatureBgPath ?? "/assets/images/furniture/bg-pro1.png",
  );
  const featureHtml = category.homepageFeatureContent?.trim()
    ? sanitizeRichHtml(category.homepageFeatureContent.trim())
    : null;

  return (
    <section className="esth-salon-section">
      <EsthContainer>
        <ScrollRevealStagger
          className={`grid items-center gap-10 lg:grid-cols-2 ${reverse ? "[&>*:first-child]:lg:order-2" : ""}`}
        >
          <ScrollRevealItem>
            <div className="esth-salon-image">
              <div
                className="esth-salon-bg-shape"
                aria-hidden
                style={{ backgroundImage: `url("${bgImagePath}")` }}
              />
              <Image
                src={imagePath}
                alt={category.title}
                width={460}
                height={460}
                sizes="(max-width: 768px) 80vw, 460px"
                className="mx-auto h-auto w-[min(78%,460px)] object-contain"
              />
            </div>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <div className="esth-salon-content">
              <h2>{category.title}</h2>
              {featureHtml ? (
                <div
                  className="esth-salon-feature-copy"
                  dangerouslySetInnerHTML={{ __html: featureHtml }}
                />
              ) : null}
              <SectionButton label="SEE COLLECTION" href={`/${category.slug}/`} />
            </div>
          </ScrollRevealItem>
        </ScrollRevealStagger>
        {showBottomLine ? (
          <div className="esth-section-divider-line esth-salon-bottom-line" aria-hidden />
        ) : null}
      </EsthContainer>
    </section>
  );
}
