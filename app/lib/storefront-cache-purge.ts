/**
 * Oxygen / Workers Cache purge helpers — Phase 6 (PERFORMANCE_ZERO_FLICKER_PLAN).
 *
 * Hydrogen stores storefront query responses in caches.open('hydrogen').
 * Each entry URL has the format: `https://shopify.dev/?{encodeURIComponent(queryKey)}`
 * where queryKey includes the full GraphQL body: query string + variables (including handle).
 *
 * On webhook receipt we open the same cache, scan all keys, and delete entries
 * whose encoded URL contains the product/collection handle. This achieves instant
 * cache invalidation for PDP/PLP pages after Shopify Admin edits,
 * bypassing the ~1-min CACHE_SHORT TTL window.
 *
 * Scope and limitations:
 * - Purge by handle: reliably clears PDP (products.$handle) and PLP collection pages.
 * - Homepage / collections-all "catch-all" entries have no handle variable — they expire
 *   via CACHE_SHORT TTL (~1 min). This is acceptable and noted in the purge result.
 * - Purge is best-effort: failures are logged, never thrown; Shopify always gets 200.
 * - waitUntil offloads deletes past the webhook ack so Shopify's 5s timeout isn't hit.
 *
 * Hydrogen cache key format (from @shopify/hydrogen/src/storefront.ts):
 *   cacheKey = [storefrontApiUrl, requestMethod, cacheKeyHeader, graphqlBody]
 *   hashKey encodes each item: for objects → JSON.stringify, else → toString
 *   result URL: `https://shopify.dev/?${encodeURIComponent(concatenated)}`
 *   graphqlBody = JSON.stringify({query, variables}) — handle appears as "handle":"slug"
 */

/** Named logical purge keys per webhook topic (used in tests + documentation). */
export const PURGE_KEYS = {
  PRODUCT_PREFIX: 'product',
  COLLECTION_PREFIX: 'collection',
  HOMEPAGE: 'homepage',
  COLLECTIONS_ALL: 'collections-all',
} as const;

export interface PurgeResult {
  /** Number of cache entries successfully deleted. */
  purged: number;
  /** Number of attempted deletes that failed. */
  failed: number;
  /** Logical key slugs that were targeted (always populated). */
  logicalKeys: string[];
  /** Subset of cache URLs that were purged (truncated for log readability). */
  purgedUrls: string[];
}

/**
 * Map a Shopify webhook topic + resource handle to logical purge key slugs.
 *
 * products/*    → ['product-{handle}', 'homepage', 'collections-all']
 * collections/* → ['collection-{handle}', 'collections-all']
 *
 * Logical keys document intent; the actual cache purge is handle-based (see purgeStorefrontCache).
 */
export function getPurgeKeysForWebhook(topic: string, handle: string): string[] {
  if (topic.startsWith('products/')) {
    return [
      `${PURGE_KEYS.PRODUCT_PREFIX}-${handle}`,
      PURGE_KEYS.HOMEPAGE,
      PURGE_KEYS.COLLECTIONS_ALL,
    ];
  }
  if (topic.startsWith('collections/')) {
    return [
      `${PURGE_KEYS.COLLECTION_PREFIX}-${handle}`,
      PURGE_KEYS.COLLECTIONS_ALL,
    ];
  }
  return [];
}

const HYDROGEN_CACHE_NAME = 'hydrogen';

/**
 * Purge Workers Cache entries related to the given resource handles.
 *
 * Opens `caches.open('hydrogen')` — same instance Hydrogen's storefront client uses.
 * Scans all cached keys and deletes those whose URL encodes the handle in the GraphQL variables.
 *
 * @param handles    - Resource handles to purge (e.g. ['my-product', 'summer-sale'])
 * @param waitUntil  - context.waitUntil — offloads async deletes past the webhook response
 * @returns PurgeResult — actual counts are async when waitUntil is provided
 */
export async function purgeStorefrontCache(
  handles: string[],
  waitUntil?: (p: Promise<unknown>) => void,
): Promise<PurgeResult> {
  const optimisticResult: PurgeResult = {
    purged: 0,
    failed: 0,
    logicalKeys: handles,
    purgedUrls: [],
  };

  if (handles.length === 0) return optimisticResult;

  const doPurge = async (): Promise<PurgeResult> => {
    const result: PurgeResult = {
      purged: 0,
      failed: 0,
      logicalKeys: handles,
      purgedUrls: [],
    };

    try {
      const cache = await caches.open(HYDROGEN_CACHE_NAME);

      /* cache.keys() available in Cloudflare Workers; may be absent in MiniOxygen dev */
      if (typeof (cache as {keys?: unknown}).keys !== 'function') {
        console.warn('[cache-purge] cache.keys not available — skipping purge');
        return result;
      }

      const allRequests = await (cache as Cache & {keys(): Promise<readonly Request[]>}).keys();
      if (allRequests.length === 0) return result;

      for (const req of allRequests) {
        const url = req.url;
        const matchesHandle = handles.some((handle) => {
          if (!handle) return false;
          /*
           * Hydrogen encodes the GraphQL body into the cache key URL as:
           *   encodeURIComponent('...' + JSON.stringify({query, variables: {handle: "slug", ...}}) + '...')
           * After encoding, "handle":"slug" becomes %22handle%22%3A%22slug%22.
           * We search both the encoded and raw form for robustness across Hydrogen versions.
           */
          const encodedPattern = encodeURIComponent(`"handle":"${handle}"`);
          return url.includes(encodedPattern) || url.includes(handle);
        });

        if (!matchesHandle) continue;

        try {
          const deleted = await cache.delete(req);
          if (deleted) {
            result.purged++;
            /* Truncate URL in log — full encoded URLs are hundreds of chars */
            result.purgedUrls.push(url.slice(0, 80));
          }
        } catch (err) {
          result.failed++;
          console.error('[cache-purge] entry delete failed', {handle: handles[0], error: String(err)});
        }
      }

      if (result.purged > 0 || result.failed > 0) {
        console.log('[cache-purge] purge complete', {
          handles,
          purged: result.purged,
          failed: result.failed,
        });
      }
    } catch (err) {
      result.failed++;
      console.error('[cache-purge] purge failed', {handles, error: String(err)});
    }

    return result;
  };

  if (waitUntil) {
    /* Fire-and-forget: deletes happen after Shopify's 200 ack — avoids 5s webhook timeout */
    waitUntil(doPurge());
    /* Return optimistic result — actual count arrives async */
    return optimisticResult;
  }

  return doPurge();
}

/**
 * Extract the raw resource handle slugs from logical purge keys.
 * e.g. ['product-my-shirt', 'homepage'] → ['my-shirt']
 * 'homepage' and 'collections-all' have no associated handle to delete by.
 */
export function extractHandlesFromPurgeKeys(logicalKeys: string[]): string[] {
  return logicalKeys
    .filter(
      (k) =>
        k.startsWith(`${PURGE_KEYS.PRODUCT_PREFIX}-`) ||
        k.startsWith(`${PURGE_KEYS.COLLECTION_PREFIX}-`),
    )
    .map((k) => k.replace(/^(?:product|collection)-/, ''))
    .filter(Boolean);
}
