/**
 * Shared clientLoader for catalog routes — Phase 7.1E.
 *
 * Caches loader payload by request.url so back-nav reuses warm data when
 * shouldRevalidate skips GET navigation. Cleared on catalog cache version bump.
 *
 * On cache miss, warms above-fold product images before React mounts so cards 2–8
 * start CDN fetch earlier than useAboveFoldImageWarm alone (deduped via zehn-image-cache).
 */
import type {ClientLoaderFunctionArgs} from 'react-router';
import {
  getClientLoaderCacheKey,
  readClientLoaderCache,
  writeClientLoaderCache,
} from '~/lib/client-loader-cache';
import {warmCatalogLoaderProducts} from '~/lib/zehn-image-warm';

export async function catalogClientLoader<T = unknown>({
  request,
  serverLoader,
}: ClientLoaderFunctionArgs): Promise<T> {
  const cacheKey = getClientLoaderCacheKey(request.url);
  const cached = readClientLoaderCache<T>(cacheKey);
  if (cached) return cached;
  const serverData = (await serverLoader()) as T;
  writeClientLoaderCache(cacheKey, serverData);
  warmCatalogLoaderProducts(serverData);
  return serverData;
}

/** Assign after route export: clientLoader.hydrate = catalogClientLoaderHydrate */
export const catalogClientLoaderHydrate = true as const;
