/**
 * ZEHN Storefront Cache Policy Matrix (Phase 4 — PERFORMANCE_ZERO_FLICKER_PLAN).
 *
 * Single source of truth for all route cache strategies.
 * Import the relevant constant in each loader and pass to storefront.query({ cache: ... }).
 *
 * Decision rules (Phase 7 — aligned with TECH_STACK_ANALYSIS.md §Caching):
 *  CacheLong  (24h)  — commerce + static content; invalidated via webhook purge (Phase 7D):
 *                       PDP, PLP, homepage, collections/all, blog, policies, robots
 *  CacheShort (1min) — legacy tier; kept for tests; commerce routes migrated to CACHE_LONG
 *  CacheNone  (0s)   — user-specific or real-time data that must never be cached at the edge:
 *                       search results (user query), cart, account, checkout
 *
 * Webhook invalidation — app/routes/webhooks.tsx + storefront-cache-purge.ts:
 *  products/*    → purge by handle + HomepageQuery + Catalog signatures + version bump
 *  collections/* → purge by handle + Catalog signature + version bump
 *  HTML pages    → Oxygen-Cache-Control SWR via oxygen-page-cache.ts (Phase 7A)
 */

import type {Storefront} from '@shopify/hydrogen';

/**
 * CacheLong — 24 h edge cache.
 * Use for: header/footer, static pages, blog content, policies, robots.txt.
 */
export const CACHE_LONG = 'long' as const;

/**
 * CacheShort — ~1 min edge cache (legacy).
 * Commerce routes use CACHE_LONG + webhook purge (Phase 7).
 */
export const CACHE_SHORT = 'short' as const;

/** Commerce catalog routes — same 24 h Workers Cache as static content; webhook invalidates. */
export const CACHE_CATALOG = CACHE_LONG;

/**
 * CacheNone — no edge cache (always fresh).
 * Use for: search queries, cart, account, wishlist, checkout redirects.
 */
export const CACHE_NONE = 'none' as const;

export type CachePolicyKey = typeof CACHE_LONG | typeof CACHE_SHORT | typeof CACHE_NONE;

/**
 * Returns the Hydrogen cache object for the given policy key.
 * Centralises the storefront.CacheLong() / CacheShort() / CacheNone() calls.
 *
 * @example
 * const {storefront} = context;
 * const data = await storefront.query(QUERY, {
 *   cache: getCachePolicy(storefront, CACHE_SHORT),
 * });
 */
export function getCachePolicy(
  storefront: Storefront,
  policy: CachePolicyKey,
): ReturnType<Storefront['CacheLong']> {
  switch (policy) {
    case CACHE_LONG:
      return storefront.CacheLong();
    case CACHE_SHORT:
      return storefront.CacheShort();
    case CACHE_NONE:
    default:
      return storefront.CacheNone();
  }
}
