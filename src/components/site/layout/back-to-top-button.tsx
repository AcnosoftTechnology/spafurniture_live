"use client";

import { ChevronsUp } from "lucide-react";
import { scrollToTop, useLenis } from "@/components/site/smooth-scroll-provider";

export function BackToTopButton() {
  const lenis = useLenis();

  return (
    <div className="wolfe-totop">
      <button type="button" aria-label="Back to top" onClick={() => scrollToTop(lenis)}>
        <ChevronsUp className="esth-back-to-top-icon" strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}
