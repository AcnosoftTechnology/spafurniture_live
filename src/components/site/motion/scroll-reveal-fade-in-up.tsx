"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useLenisInView } from "@/hooks/use-lenis-in-view";

/** animate.css fadeInUp — one-time entrance from fully below (translateY 100%). */
const FADE_IN_UP_EASE = [0.215, 0.61, 0.355, 1] as const;

type ScrollRevealFadeInUpProps = {
  children: ReactNode;
  className?: string;
  clipClassName?: string;
  /** Same as data-wow-delay, e.g. 0.4s on reference site. */
  delay?: number;
  duration?: number;
  /** Starting offset — animate.css fadeInUp uses 100%. */
  y?: number | string;
};

export function ScrollRevealFadeInUp({
  children,
  className,
  clipClassName,
  delay = 0.4,
  duration = 1,
  y = "100%",
}: ScrollRevealFadeInUpProps) {
  const clipRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useLenisInView(clipRef, {
    once: true,
    amount: 0.08,
    margin: "0px 0px -40px 0px",
  });

  if (reducedMotion) {
    return (
      <div ref={clipRef} className={clipClassName ?? "esth-fade-in-up-clip"}>
        <div className={className}>{children}</div>
      </div>
    );
  }

  return (
    <div ref={clipRef} className={clipClassName ?? "esth-fade-in-up-clip"}>
      <motion.div
        className={className}
        initial={{ opacity: 0, y }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
        transition={{ duration, delay, ease: FADE_IN_UP_EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}
