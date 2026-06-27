/**
 * Touch-aware Link prefetch resolver — Phase 7 instant nav on mobile.
 *
 * Tier strategy (BL-0020 / catalog perf):
 *  - product: always 'intent' on all devices — viewport-prefetching 40+ grid cards bloats
 *    the __manifest URL and causes unnecessary network requests before user interacts.
 *  - nav / cta: 'viewport' on touch (pre-fetch before tap), 'intent' on fine-pointer (hover).
 *  - collection: 'intent' on both — not critical enough for viewport prefetch.
 */
import type {LinkProps} from 'react-router';

export type ZehnPrefetchTier = 'nav' | 'product' | 'collection' | 'cta';

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

/**
 * Returns the React Router prefetch strategy for the given tier.
 * Call at component render time (client-only matchMedia is guarded by SSR check).
 */
export function resolveLinkPrefetch(
  tier: ZehnPrefetchTier = 'nav',
): LinkProps['prefetch'] {
  // Product grid cards: intent-only on all devices — prevents all 40+ cards from
  // appearing in the viewport __manifest batch and bloating the prefetch waterfall.
  if (tier === 'product') return 'intent';

  if (typeof window === 'undefined') {
    // SSR fallback: nav/cta links get viewport so first paint includes prefetch hints.
    return tier === 'nav' || tier === 'cta' ? 'viewport' : 'intent';
  }

  try {
    const isFinePointer = window.matchMedia(FINE_POINTER_QUERY).matches;
    // Nav and CTA links: viewport on touch (tap needs data ready), intent on desktop (hover).
    if (tier === 'nav' || tier === 'cta') return isFinePointer ? 'intent' : 'viewport';
    // Collection links: intent on both — navigating to a collection is deliberate.
    return 'intent';
  } catch {
    return 'intent';
  }
}
