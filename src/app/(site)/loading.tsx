import { HeroBannerSkeleton } from "@/components/site/home/hero-banner-skeleton";
import { ShimmerSkeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <>
      <HeroBannerSkeleton />
      <div className="esth-page-shell space-y-6 py-16">
        <ShimmerSkeleton className="mx-auto h-64 max-w-4xl rounded-xl" />
        <ShimmerSkeleton className="mx-auto h-40 max-w-6xl rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <ShimmerSkeleton className="h-80 rounded-xl" />
          <ShimmerSkeleton className="h-80 rounded-xl" />
        </div>
      </div>
    </>
  );
}
