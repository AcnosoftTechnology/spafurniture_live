"use client";

import { useEffect } from "react";
import { useLenis } from "@/components/site/smooth-scroll-provider";

/** Re-sync scroll/parallax after homepage streams in and images settle. */
export function HomepageClientFix() {
  const lenis = useLenis();

  useEffect(() => {
    const refresh = () => {
      lenis?.resize();
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
    };

    refresh();
    const timers = [120, 450, 1200, 2800].map((ms) => window.setTimeout(refresh, ms));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [lenis]);

  return null;
}
