/**
 * In-memory clientLoader cache — Phase 7 instant back-navigation.
 *
 * Module-level Map survives SPA navigations; cleared when catalog cache version bumps.
 */
const clientLoaderCache = new Map<string, unknown>();

export function getClientLoaderCacheKey(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export function readClientLoaderCache<T>(key: string): T | undefined {
  return clientLoaderCache.get(key) as T | undefined;
}

export function writeClientLoaderCache<T>(key: string, value: T): void {
  clientLoaderCache.set(key, value);
}

/** Clears all cached clientLoader entries — call after catalog version bump. */
export function clearClientLoaderCache(): void {
  clientLoaderCache.clear();
}
