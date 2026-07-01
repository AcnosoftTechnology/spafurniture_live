import { EsthContainer } from "@/components/site/layout/esth-container";
import { ScrollRevealItem, ScrollRevealStagger } from "@/components/site/motion/scroll-reveal";
import type { HomepageContent } from "@/features/homepage/schemas/homepage-content.schema";

export function ProductsIntro({ data }: { data: HomepageContent["productsIntro"] }) {
  const [line1, line2] = data.heading.split("\n");

  return (
    <section className="esth-crafted-section" id="products">
      <EsthContainer>
        <ScrollRevealStagger className="grid items-start gap-8 lg:grid-cols-12">
          <ScrollRevealItem className="lg:col-span-4">
            <div className="esth-crafted-left">
              <span>{data.tag}</span>

              <h2>
                {line1}
                {line2 ? (
                  <>
                    <br />
                    {line2}
                  </>
                ) : null}
              </h2>
            </div>
          </ScrollRevealItem>

          <div className="lg:col-span-8">
            <div className="esth-crafted-right">
              <p>{data.body}</p>
            </div>
          </div>
        </ScrollRevealStagger>

        <div className="esth-crafted-line" />
      </EsthContainer>
    </section>
  );
}