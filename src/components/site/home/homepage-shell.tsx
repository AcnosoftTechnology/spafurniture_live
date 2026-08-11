import { Suspense } from "react";
import dynamic from "next/dynamic";
import { HeroBanner } from "@/components/site/home/hero-banner";
import { HeroBannerSkeleton } from "@/components/site/home/hero-banner-skeleton";
import { BackgroundTextSection } from "@/components/site/home/background-text-section";
import { ProductsIntro } from "@/components/site/home/products-intro";
import { ProductFeatureSection } from "@/components/site/home/product-feature-section";
import { SpecialitySection } from "@/components/site/home/speciality-section";
import { FaqSection } from "@/components/site/home/faq-section";
import { ShimmerSkeleton } from "@/components/ui/skeleton";
import { getHomepageData } from "@/features/homepage/get-homepage-data";
import { getTestimonialsSectionData } from "@/features/testimonials/get-testimonials-data";

const TestimonialsSection = dynamic(
  () =>
    import("@/components/site/testimonials/testimonials-section").then((mod) => mod.TestimonialsSection),
  { loading: () => <ShimmerSkeleton className="mx-auto my-16 h-64 w-full max-w-6xl" aria-hidden /> },
);

const HowWeDoSlider = dynamic(
  () => import("@/components/site/home/logo-sliders").then((mod) => mod.HowWeDoSlider),
  { loading: () => <ShimmerSkeleton className="mx-auto my-12 h-40 w-full max-w-5xl" aria-hidden /> },
);

const ClientsSlider = dynamic(
  () => import("@/components/site/home/logo-sliders").then((mod) => mod.ClientsSlider),
  { loading: () => <ShimmerSkeleton className="mx-auto my-12 h-40 w-full max-w-5xl" aria-hidden /> },
);

function SectionBlockSkeleton({ className }: { className?: string }) {
  return <ShimmerSkeleton className={className ?? "h-48 w-full rounded-xl"} aria-hidden />;
}

export async function HomepageContent() {
  const [{ content, categories, faqs }, testimonials] = await Promise.all([
    getHomepageData(),
    getTestimonialsSectionData(),
  ]);

  return (
    <>
      <HeroBanner hero={content.hero} />
      <BackgroundTextSection data={content.backgroundText} />
      <ProductsIntro data={content.productsIntro} />

      {categories.map((category, index) => (
        <ProductFeatureSection
          key={category.id}
          category={category}
          reverse={index % 2 !== 0}
          showBottomLine={index < categories.length - 1}
        />
      ))}

      <SpecialitySection data={content.speciality} />
      <HowWeDoSlider data={content.howWeDo} />
      <ClientsSlider data={content.clients} />
      <TestimonialsSection
        title={testimonials.content.section.title}
        subtitle={testimonials.content.section.subtitle}
        reviews={testimonials.reviews}
        carousel={testimonials.content.carousel}
      />
      <FaqSection items={faqs} />
    </>
  );
}

export function HomepageShell() {
  return (
    <Suspense
      fallback={
        <>
          <HeroBannerSkeleton />
          <SectionBlockSkeleton className="mx-auto my-16 h-64 max-w-4xl" />
          <SectionBlockSkeleton className="mx-auto my-16 h-40 max-w-6xl" />
        </>
      }
    >
      <HomepageContent />
    </Suspense>
  );
}
