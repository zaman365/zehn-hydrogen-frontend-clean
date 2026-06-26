/**
 * Oxygen full-page cache headers — Phase 7 (PERFORMANCE_ZERO_FLICKER_PLAN).
 *
 * Two cache layers (do not conflate):
 * 1. Workers `hydrogen` cache — GraphQL subrequests via getCachePolicy(); purged by webhooks.
 * 2. Oxygen FPC — HTML documents keyed by URL; controlled by Oxygen-Cache-Control here.
 *    Not programmatically purgeable from the worker (no Oxygen Admin purge in Hydrogen).
 *    Invalidates via TTL/SWR + redeploy. Open-tab freshness uses catalog version bump + revalidator.
 *
 * @see https://shopify.dev/docs/storefronts/headless/hydrogen/caching/full-page-cache
 */
import {
  CacheCustom,
  CacheLong,
  CacheNone,
  generateCacheControlHeader,
} from '@shopify/hydrogen';

/** Page-level cache tier — maps to Oxygen FPC + browser Cache-Control. */
export type OxygenPageCachePolicy = 'catalog' | 'static' | 'none';

/** Catalog commerce pages: 1 h fresh, 24 h stale-while-revalidate at Oxygen edge. */
const CATALOG_PAGE_STRATEGY = CacheCustom({
  mode: 'public',
  maxAge: 3600,
  staleWhileRevalidate: 86400,
});

/** Static CMS/blog/policy pages: 24 h fresh at edge. */
const STATIC_PAGE_STRATEGY = CacheLong();

/** User-specific or dynamic pages — never cache HTML at shared edge. */
const NONE_PAGE_STRATEGY = CacheNone();

function resolvePageStrategy(policy: OxygenPageCachePolicy) {
  switch (policy) {
    case 'catalog':
      return CATALOG_PAGE_STRATEGY;
    case 'static':
      return STATIC_PAGE_STRATEGY;
    case 'none':
    default:
      return NONE_PAGE_STRATEGY;
  }
}

/**
 * Returns loader response headers for Oxygen full-page cache + browser Cache-Control.
 * Apply via react-router `data(payload, { headers: getOxygenPageCacheHeaders('catalog') })`.
 */
export function getOxygenPageCacheHeaders(
  policy: OxygenPageCachePolicy,
): HeadersInit {
  const cacheControl = generateCacheControlHeader(resolvePageStrategy(policy));

  if (policy === 'none') {
    return {
      'Cache-Control': cacheControl,
      'Oxygen-Cache-Control': cacheControl,
    };
  }

  return {
    'Cache-Control': cacheControl,
    'Oxygen-Cache-Control': cacheControl,
  };
}
