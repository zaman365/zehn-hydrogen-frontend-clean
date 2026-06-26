/**
 * Touch-aware Link prefetch resolver — Phase 7 instant nav on mobile.
 *
 * Desktop (hover + fine pointer): prefetch="intent" on hover.
 * Touch/coarse pointer: prefetch="viewport" so data loads before tap.
 */
import type {LinkProps} from 'react-router';

export type ZehnPrefetchTier = 'nav' | 'product' | 'collection' | 'cta';

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

/** SSR-safe default — viewport prefetch (mobile-first). */
export function resolveLinkPrefetch(
  _tier: ZehnPrefetchTier = 'nav',
): LinkProps['prefetch'] {
  if (typeof window === 'undefined') {
    return 'viewport';
  }

  try {
    return window.matchMedia(FINE_POINTER_QUERY).matches ? 'intent' : 'viewport';
  } catch {
    return 'viewport';
  }
}
