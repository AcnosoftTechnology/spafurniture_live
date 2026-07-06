type ParallaxSectionBgProps = {
  className?: string;
  imageUrl: string;
  maxShift?: number;
  strength?: number;
  parallaxScale?: number;
  revealOffset?: number;
  revealDistance?: number;
  revealEndShift?: number;
};

/** Static section background — no scroll-linked JS (native scroll only). */
export function ParallaxSectionBg({ className, imageUrl }: ParallaxSectionBgProps) {
  return (
    <div
      className={className}
      aria-hidden
      style={{ backgroundImage: `url("${imageUrl}")` }}
    />
  );
}
