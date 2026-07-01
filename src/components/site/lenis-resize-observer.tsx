"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "@/components/site/smooth-scroll-provider";

/** Keep Lenis scroll height in sync after route changes, images, and layout shifts. */
export function LenisResizeObserver() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (!lenis) return;

    const resize = () => {
      lenis.resize();
    };

    resize();

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("orientationchange", resize);
    window.addEventListener("load", resize);
    document.fonts?.ready?.then(resize);

    const observer = new ResizeObserver(() => resize());
    observer.observe(document.documentElement);
    if (document.body) observer.observe(document.body);

    const imageLoads = () => {
      document.querySelectorAll("img").forEach((img) => {
        if (!img.complete) {
          img.addEventListener("load", resize, { once: true });
        }
      });
    };

    imageLoads();
    const imagePoll = window.setInterval(imageLoads, 400);
    const stopPoll = window.setTimeout(() => window.clearInterval(imagePoll), 8000);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      window.removeEventListener("load", resize);
      observer.disconnect();
      window.clearInterval(imagePoll);
      window.clearTimeout(stopPoll);
    };
  }, [lenis, pathname]);

  return null;
}
