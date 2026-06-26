/**
 * Catalog cache version — Phase 7 invalidation signal without Redis/SSE.
 *
 * Webhook bumps a monotonic timestamp in Workers Cache; clients compare on focus
 * and call useRevalidator() when the version changes.
 */
const HYDROGEN_CACHE_NAME = 'hydrogen';

/** Stable URL key for the version entry inside caches.open('hydrogen'). */
export const CATALOG_CACHE_VERSION_URL = 'https://zehn.cache/catalog-version';

export type CatalogCacheVersionPayload = {
  version: number;
};

/**
 * Read the current catalog cache version (0 when unset).
 */
export async function readCatalogCacheVersion(): Promise<number> {
  try {
    const cache = await caches.open(HYDROGEN_CACHE_NAME);
    const response = await cache.match(CATALOG_CACHE_VERSION_URL);
    if (!response) return 0;
    const text = await response.text();
    const parsed = Number.parseInt(text, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

/**
 * Bump catalog cache version — called from webhook after Workers Cache purge.
 */
export async function bumpCatalogCacheVersion(): Promise<number> {
  const version = Date.now();
  try {
    const cache = await caches.open(HYDROGEN_CACHE_NAME);
    await cache.put(
      CATALOG_CACHE_VERSION_URL,
      new Response(String(version), {
        headers: {'Cache-Control': 'no-store'},
      }),
    );
  } catch (err) {
    console.error('[catalog-cache-version] bump failed', String(err));
  }
  return version;
}

/**
 * Compare two version numbers — true when server version is newer than client.
 */
export function isCatalogCacheVersionStale(
  clientVersion: number,
  serverVersion: number,
): boolean {
  return serverVersion > clientVersion;
}
