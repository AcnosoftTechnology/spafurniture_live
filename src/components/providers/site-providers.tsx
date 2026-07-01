"use client";

import dynamic from "next/dynamic";

const SiteToaster = dynamic(
  () => import("sonner").then((mod) => mod.Toaster),
  { ssr: false },
);

export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SiteToaster richColors position="top-right" />
    </>
  );
}
