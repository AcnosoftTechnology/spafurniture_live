"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useLenisInView } from "@/hooks/use-lenis-in-view";

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const DEFAULT_VIEWPORT = { once: true, amount: 0.12, margin: "0px 0px -4% 0px" } as const;

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  /** Fraction of element visible before animation starts (0–1). Higher = section more in view first. */
  viewportAmount?: number;
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 48,
  duration = 0.7,
  viewportAmount = DEFAULT_VIEWPORT.amount,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useLenisInView(ref, { ...DEFAULT_VIEWPORT, amount: viewportAmount });

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, delay, ease: REVEAL_EASE }}
    >
      {children}
    </motion.div>
  );
}

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: REVEAL_EASE },
  },
};

type ScrollRevealStaggerProps = {
  children: ReactNode;
  className?: string;
};

export function ScrollRevealStagger({ children, className }: ScrollRevealStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useLenisInView(ref, DEFAULT_VIEWPORT);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainerVariants}
    >
      {children}
    </motion.div>
  );
}

type ScrollRevealItemProps = {
  children: ReactNode;
  className?: string;
};

export function ScrollRevealItem({ children, className }: ScrollRevealItemProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={staggerItemVariants}>
      {children}
    </motion.div>
  );
}
