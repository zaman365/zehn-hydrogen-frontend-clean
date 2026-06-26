/**
 * Shared image paint cache — Phase 7 zero-remount images.
 *
 * Single module Set keyed by normalized CDN URL (including width bucket).
 * Survives SPA navigation; cleared only on hard reload.
 */
const loadedImageKeys = new Set<string>();

/** Width query params Hydrogen Image appends — preserved for cache key accuracy. */
const WIDTH_PARAM = 'width';

/**
 * Normalize a Shopify CDN or static image URL for cache lookup.
 * Strips volatile params (v, cache bust) but keeps width bucket when present.
 */
export function normalizeImageCacheKey(url: string): string {
  if (!url) return '';

  try {
    const parsed = new URL(url, 'https://cdn.shopify.com');
    const width = parsed.searchParams.get(WIDTH_PARAM);
    parsed.search = '';
    if (width) {
      parsed.searchParams.set(WIDTH_PARAM, width);
    }
    return parsed.toString();
  } catch {
    return url.split('?')[0] ?? url;
  }
}

export function isImageCached(url: string): boolean {
  const key = normalizeImageCacheKey(url);
  return key !== '' && loadedImageKeys.has(key);
}

export function markImageCached(url: string): void {
  const key = normalizeImageCacheKey(url);
  if (key) loadedImageKeys.add(key);
}

/** Prefer img.currentSrc (resolved srcSet entry) over data.url for cache keys. */
export function markImageCachedFromElement(img: HTMLImageElement | null): void {
  if (!img?.complete || img.naturalWidth <= 0) return;
  const src = img.currentSrc || img.src;
  if (src) markImageCached(src);
}
