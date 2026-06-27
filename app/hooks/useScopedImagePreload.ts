/**
 * Route-scoped LCP image preload — cleans up on unmount (BL-0020).
 * Skips when URL empty or already in zehn-image-cache.
 */
import {useEffect} from 'react';
import {
  scopedImagePreload,
  type ScopedImagePreloadOptions,
} from '~/lib/zehn-image-preload';
import {isImageCached, normalizeImageCacheKey} from '~/lib/zehn-image-cache';

export function useScopedImagePreload(
  url: string | null | undefined,
  options?: ScopedImagePreloadOptions,
): void {
  const fetchPriority = options?.fetchPriority;

  useEffect(() => {
    if (!url) return;

    const key = normalizeImageCacheKey(url);
    if (key && isImageCached(key)) return;

    return scopedImagePreload(url, {fetchPriority});
  }, [url, fetchPriority]);
}
