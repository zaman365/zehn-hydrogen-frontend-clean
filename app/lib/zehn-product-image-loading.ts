/**
 * Product card image loading — shared resolver for grids and horizontal sliders.
 *
 * Tiers (see ZehnShopifyImage):
 *  - isLCP: eager + fetchpriority high, no skeleton (first visible card only)
 *  - priority: eager, pulse skeleton until load, image opacity 100 immediately
 *  - skipSkeleton: eager, no pulse (sliders, PDP thumbnails)
 *  - default (lazy): opacity gate + skeleton until onLoad
 */

export type ProductImageLoadContext =
  | 'horizontalSlider'
  | 'gridAboveFold'
  | 'gridBelowFold';

export type ResolvedProductImageLoading = {
  loading: 'eager' | 'lazy';
  priority: boolean;
  isLCP: boolean;
  /** When true, ZehnShopifyImage skips pulse skeleton (frame aspect ratio holds layout). */
  skipSkeleton?: boolean;
};

export type ResolveProductImageLoadingOptions = {
  /** Grid cells treated as above-fold (gridAboveFold only). */
  aboveFoldLimit?: number;
};

/** Default above-fold row count for collection grids (2 rows × 3 cols desktop). */
export const ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT = 8 as const;

/** Homepage category strip — first horizontal snap row on mobile. */
export const ZEHN_HOMEPAGE_CATEGORY_GRID_ABOVE_FOLD_LIMIT = 4 as const;

/** Search results — first two rows on desktop. */
export const ZEHN_SEARCH_GRID_ABOVE_FOLD_LIMIT = 6 as const;

/** Homepage horizontal slider cards — ~280px rendered width. */
export const ZEHN_HOMEPAGE_SLIDER_SIZES = '280px' as const;

export function resolveProductImageLoading(
  context: ProductImageLoadContext,
  index: number,
  options?: ResolveProductImageLoadingOptions,
): ResolvedProductImageLoading {
  if (context === 'horizontalSlider') {
    // Eager all cards; skip skeleton — warmImageUrls + fixed aspect frame prevent flash.
    return {loading: 'eager', priority: true, isLCP: false, skipSkeleton: true};
  }

  if (context === 'gridBelowFold') {
    return {loading: 'lazy', priority: false, isLCP: false};
  }

  const limit = options?.aboveFoldLimit ?? ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT;
  const aboveFold = index < limit;

  return {
    loading: aboveFold ? 'eager' : 'lazy',
    priority: aboveFold,
    isLCP: index === 0,
  };
}
