/**
 * Scoped `<link rel="preload">` for route-bound LCP images (BL-0020).
 *
 * Injects into document.head on mount; cleanup removes the node on SPA leave —
 * avoids stale preload warnings that meta() tags leave after navigation.
 */
import {isImageCached, normalizeImageCacheKey} from '~/lib/zehn-image-cache';

export type ScopedImagePreloadOptions = {
  /** Lowercase DOM attr — React 18 warns on camelCase fetchPriority on <link>. */
  fetchPriority?: 'high' | 'low' | 'auto';
};

const PRELOAD_ATTR = 'data-zehn-scoped-preload';

/** Inject preload link; returns cleanup that removes it from head. */
export function scopedImagePreload(
  url: string,
  options: ScopedImagePreloadOptions = {},
): () => void {
  if (typeof document === 'undefined' || !url) return () => {};

  const key = normalizeImageCacheKey(url);
  if (key && isImageCached(key)) return () => {};

  /* Skip if meta() already injected a matching preload (cold SSR visit) — avoids duplicate
     <link rel="preload"> in head. Browser deduplicates fetches by URL anyway, but explicit
     dedup is cleaner and prevents an extra DOM node on every cold PDP mount. */
  if (document.querySelector(`link[rel="preload"][href="${url}"]`)) return () => {};

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  link.setAttribute(PRELOAD_ATTR, 'true');

  const priority = options.fetchPriority ?? 'high';
  if (priority !== 'auto') {
    link.setAttribute('fetchpriority', priority);
  }

  document.head.appendChild(link);

  return () => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  };
}
