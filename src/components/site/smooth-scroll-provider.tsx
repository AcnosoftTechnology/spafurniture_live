"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type Lenis from "lenis";

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
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (reducedMotion || isTouch) return;

    let instance: Lenis | null = null;
    let cancelled = false;
    let resizeTimers: number[] = [];

    const init = async () => {
      const { default: LenisCtor } = await import("lenis");
      if (cancelled) return;

      instance = new LenisCtor({
        smoothWheel: true,
        lerp: 0.09,
        wheelMultiplier: 1.65,
        touchMultiplier: 1.35,
        syncTouch: false,
        autoRaf: true,
        anchors: {
          duration: 0.95,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        },
        stopInertiaOnNavigate: true,
      });

      const resize = () => instance?.resize();
      resize();
      requestAnimationFrame(resize);
      resizeTimers = [120, 450, 1200].map((ms) => window.setTimeout(resize, ms));

      setLenis(instance);
    };

    let idleCallbackId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const scheduleIdle = window.requestIdleCallback?.bind(window);
    if (scheduleIdle) {
      idleCallbackId = scheduleIdle(() => void init(), { timeout: 2500 });
    } else {
      timeoutId = setTimeout(() => void init(), 150);
    }

    return () => {
      cancelled = true;
      if (idleCallbackId !== undefined) window.cancelIdleCallback(idleCallbackId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      resizeTimers.forEach((timer) => window.clearTimeout(timer));
      instance?.destroy();
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
