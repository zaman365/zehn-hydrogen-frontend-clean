/**
 * Trust strip reveal timing — parallel with hero title, same 180ms stagger (REQ-0007 / ART-0044).
 * Sync with .hero-reveal-delay-* in app.css (180ms steps).
 */

/** Hero stagger step between title, subtitle, CTA, and trust items (ms). */
export const HERO_REVEAL_STAGGER_MS = 180;

/** Hero title base — .hero-reveal has no animation-delay. */
export const HERO_REVEAL_TITLE_DELAY_MS = 0;

/** First trust item starts with hero title (not after CTA). */
export const TRUST_STRIP_REVEAL_BASE_DELAY_MS = HERO_REVEAL_TITLE_DELAY_MS;

/** Per-item delay — continues hero-reveal cadence from title base. */
export function getTrustStripRevealDelayMs(index: number): number {
  return TRUST_STRIP_REVEAL_BASE_DELAY_MS + index * HERO_REVEAL_STAGGER_MS;
}
