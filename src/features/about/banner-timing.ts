/** Derive banner autoplay + transition timing from admin "seconds" field. */
export function getAboutBannerTiming(autoplaySeconds: number) {
  const seconds = Math.min(60, Math.max(2, autoplaySeconds));
  const delayMs = Math.round(seconds * 1000);
  const transitionMs = Math.min(5000, Math.max(350, Math.round(seconds * 250)));
  const bladeMs = Math.round(transitionMs * 0.82);
  const sheenMs = Math.round(transitionMs * 0.96);

  return {
    delayMs,
    transitionMs,
    bladeMs,
    sheenMs,
    bladeStaggerMs: Math.max(35, Math.round(transitionMs / 16)),
  };
}
