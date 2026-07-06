import dynamic from "next/dynamic";
import { HeroBanner } from "@/components/site/home/hero-banner";
import { ProductsIntro } from "@/components/site/home/products-intro";
import { ProductFeatureSection } from "@/components/site/home/product-feature-section";
import { RegionalIntroSection } from "@/components/site/regional/regional-intro-section";
import { HomepageClientFix } from "@/components/site/home/homepage-client-fix";
import { ShimmerSkeleton } from "@/components/ui/skeleton";
import type { RegionalPageData } from "@/features/regional-pages/get-regional-page-data";

const ClientsSlider = dynamic(
  () => import("@/components/site/home/logo-sliders").then((mod) => mod.ClientsSlider),
  { loading: () => <ShimmerSkeleton className="mx-auto my-12 h-40 w-full max-w-5xl" aria-hidden /> },
);

export function RegionalLandingView({
  slug,
  content,
  categories,
  clients,
}: RegionalPageData & { slug: string }) {
  return (
    <>
      <HeroBanner
        hero={content.hero}
        sectionId={slug}
        caption={content.hero.caption}
        variant="regional"
      />
      <RegionalIntroSection data={content.intro} />
      <ProductsIntro data={content.productsIntro} />

      {categories.map((category, index) => (
        <ProductFeatureSection
          key={category.id}
          category={category}
          reverse={index % 2 !== 0}
          showBottomLine={index < categories.length - 1}
        />
      ))}

      <ClientsSlider data={clients} />
      <HomepageClientFix />
    </>
  );
}
