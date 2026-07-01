"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

type SmoothScrollProviderProps = {
  children: ReactNode;
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    const instance = new Lenis({
      smoothWheel: true,
      lerp: 0.09,
      wheelMultiplier: 1.65,
      touchMultiplier: 1.35,
      // Keep Lenis scroll position aligned with touch on phones.
      syncTouch: isTouch,
      autoRaf: true,
      anchors: {
        duration: 0.95,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      },
      stopInertiaOnNavigate: true,
    });

    const resize = () => instance.resize();
    resize();
    requestAnimationFrame(resize);
    const resizeTimers = [120, 450, 1200].map((ms) => window.setTimeout(resize, ms));

    setLenis(instance);

    return () => {
      resizeTimers.forEach((timer) => window.clearTimeout(timer));
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export function scrollToTop(lenis: Lenis | null) {
  if (lenis) {
    lenis.scrollTo(0, {
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    return;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}
