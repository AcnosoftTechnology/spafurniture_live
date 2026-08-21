type ParallaxSectionBgProps = {
  className?: string;
  /** Empty / null keeps the layout layer without painting a background. */
  imageUrl?: string | null;
  maxShift?: number;
  strength?: number;
  parallaxScale?: number;
  revealOffset?: number;
  revealDistance?: number;
  revealEndShift?: number;
};

/** Static section background — no scroll-linked JS (native scroll only). */
export function ParallaxSectionBg({ className, imageUrl }: ParallaxSectionBgProps) {
  const url = imageUrl?.trim();
  return (
    <div
      className={className}
      aria-hidden
      style={url ? { backgroundImage: `url("${url}")` } : undefined}
    />
  );
}
