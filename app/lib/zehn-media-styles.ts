/**
 * ZEHN media primitives — shared style tokens (Phase 2, PERFORMANCE_ZERO_FLICKER_PLAN §Phase 2).
 *
 * Usage rules:
 *  - ZEHN_MEDIA_SKELETON goes only on the image frame, never the whole card.
 *  - ZEHN_MEDIA_ASPECT values come from brand asset specs (see plan + Hero.tsx comment).
 *  - LCP images (first visible row, hero) skip the skeleton and render immediately.
 */

/** Inline pulse skeleton — rendered inside the image frame until the image loads. */
export const ZEHN_MEDIA_SKELETON =
  'absolute inset-0 animate-pulse bg-muted/40 pointer-events-none' as const;

/**
 * Skeleton fade-out when image loads.
 * Matches ProductItem.tsx existing pattern (duration-300 opacity fade).
 */
export const ZEHN_MEDIA_SKELETON_FADE = 'transition-opacity duration-300' as const;

/**
 * Image fade-in after load.
 * Matches ProductItem.tsx: 700 ms + custom cubic ease for smooth reveal.
 */
export const ZEHN_MEDIA_FADE_IN =
  'transition-opacity duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]' as const;

/**
 * Aspect-ratio tokens derived from brand asset dimensions:
 *  product    7:10  — portrait product cards (ProductItem, CompactProductCard, CollectionPage)
 *  hero       5:2   — desktop hero banner (3000×1200)
 *  heroMobile 4:5   — mobile hero banner (1080×1350)
 *  square     1:1   — category tiles, swatches
 *  slider     4:3   — feature/editorial sliders (landscape)
 *  sliderCard 3:4   — portrait product cards in standalone ProductSlider
 */
export const ZEHN_MEDIA_ASPECT = {
  product: 'aspect-[7/10]',
  hero: 'aspect-[5/2]',
  heroMobile: 'aspect-[4/5]',
  square: 'aspect-square',
  slider: 'aspect-[4/3]',
  sliderCard: 'aspect-[3/4]',
} as const;

export type ZehnMediaAspectKey = keyof typeof ZEHN_MEDIA_ASPECT;
