/**
 * ZEHN Storefront Cache Policy Matrix (Phase 4 — PERFORMANCE_ZERO_FLICKER_PLAN).
 *
 * Single source of truth for all route cache strategies.
 * Import the relevant constant in each loader and pass to storefront.query({ cache: ... }).
 *
 * Decision rules (aligned with TECH_STACK_ANALYSIS.md §Caching):
 *  CacheLong  (24h)  — content that never changes without a Shopify Admin edit:
 *                       header/footer menus, static pages, policies, blog articles, robots
 *  CacheShort (1min) — content a merchant may update during a business day:
 *                       homepage product lists, collection PLPs, PDPs
 *  CacheNone  (0s)   — user-specific or real-time data that must never be cached at the edge:
 *                       search results (user query), cart, account, checkout
 *
 * Webhook invalidation (Phase 5) will purge CacheLong PDP/collection entries on
 * PRODUCTS_UPDATE / COLLECTIONS_UPDATE so stale data stays off-edge.
 */

import type {Storefront} from '@shopify/hydrogen';

/**
 * CacheLong — 24 h edge cache.
 * Use for: header/footer, static pages, blog content, policies, robots.txt.
 */
export const CACHE_LONG = 'long' as const;

/**
 * CacheShort — ~1 min edge cache.
 * Use for: homepage, collection PLPs, PDPs, recommended products.
 */
export const CACHE_SHORT = 'short' as const;

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
