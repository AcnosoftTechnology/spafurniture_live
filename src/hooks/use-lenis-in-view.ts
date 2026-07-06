"use client";

import { useInView } from "framer-motion";
import type { RefObject } from "react";

type LenisInViewOptions = {
  once?: boolean;
  amount?: number;
  margin?: string;
};

/** Scroll reveal visibility — Framer useInView only (native document scroll). */
export function useLenisInView(
  ref: RefObject<HTMLElement | null>,
  { once = true, amount = 0.12, margin }: LenisInViewOptions = {},
) {
  return useInView(ref, {
    once,
    amount,
    ...(margin ? { margin: margin as `${number}px ${number}px ${number}px ${number}px` } : {}),
  });
}
