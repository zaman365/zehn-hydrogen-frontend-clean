/**
 * Proactive image warm hooks — pre-paint on client via useIsomorphicLayoutEffect.
 *
 * useWarmImageUrls: explicit URL list (homepage sliders).
 * useAboveFoldImageWarm: product nodes sliced to above-fold limit (collection grids).
 */
import {useIsomorphicLayoutEffect} from '~/hooks/useIsomorphicLayoutEffect';
import {collectFeaturedImageUrls, warmImageUrls} from '~/lib/zehn-image-warm';
import {ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT} from '~/lib/zehn-product-image-loading';

type ProductWithFeaturedImage = {
  featuredImage?: {url?: string | null} | null;
};

/** Pre-paint warm for an explicit URL list (homepage sliders, etc.). */
export function useWarmImageUrls(urls: string[]): void {
  useIsomorphicLayoutEffect(() => {
    warmImageUrls(urls);
  }, [urls]);
}

export function useAboveFoldImageWarm(
  products: ProductWithFeaturedImage[] | null | undefined,
  limit: number = ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT,
): void {
  useIsomorphicLayoutEffect(() => {
    const aboveFold = (products ?? []).slice(0, limit);
    warmImageUrls(collectFeaturedImageUrls(aboveFold));
  }, [products, limit]);
}
