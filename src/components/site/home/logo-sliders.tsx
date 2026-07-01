"use client";

import dynamic from "next/dynamic";
import { ShimmerSkeleton } from "@/components/ui/skeleton";
import type { HomepageContent } from "@/features/homepage/schemas/homepage-content.schema";

const LogoSliderSection = dynamic(
  () => import("@/components/site/home/logo-slider-section").then((m) => m.LogoSliderSection),
  {
    loading: () => (
      <section className="esth-client-section py-24" aria-hidden>
        <div className="mx-auto max-w-[1400px] px-4">
          <ShimmerSkeleton className="mx-auto mb-8 h-8 w-64" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ShimmerSkeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    ),
    ssr: false,
  },
);

const HowWeDoSection = dynamic(
  () => import("@/components/site/home/how-we-do-section").then((m) => m.HowWeDoSection),
  {
    loading: () => (
      <section className="esth-client-section how-what py-24" aria-hidden>
        <div className="mx-auto max-w-[1400px] px-4">
          <ShimmerSkeleton className="mx-auto mb-8 h-8 w-64" />
          <ShimmerSkeleton className="h-40 w-full rounded-sm" />
        </div>
      </section>
    ),
    ssr: false,
  },
);

export function HowWeDoSlider({ data }: { data: HomepageContent["howWeDo"] }) {
  return <HowWeDoSection data={data} />;
}

export function ClientsSlider({ data }: { data: HomepageContent["clients"] }) {
  return (
    <LogoSliderSection
      id="clients"
      sectionClassName="esth-client-section clientsSec"
      data={data}
      slidesPerView={{ sm: 2, md: 4, lg: 5 }}
      navigationClass="clients-nav"
      compactLogos
      cta={data.cta ?? null}
    />
  );
}
