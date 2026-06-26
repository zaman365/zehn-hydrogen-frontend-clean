/**
 * UNIT TESTS — zehn-image-cache.ts (Phase 7C).
 */
import {describe, it, expect, beforeEach} from 'vitest';
import {
  normalizeImageCacheKey,
  isImageCached,
  markImageCached,
} from '~/lib/zehn-image-cache';

describe('zehn-image-cache', () => {
  beforeEach(() => {
    /* Keys persist module-wide — use unique URLs per test where needed */
  });

  it('normalizes Shopify CDN URLs and preserves width bucket', () => {
    const key = normalizeImageCacheKey(
      'https://cdn.shopify.com/s/files/1/1/files/shirt.jpg?v=123&width=800',
    );
    expect(key).toContain('width=800');
    expect(key).not.toContain('v=123');
  });

  it('tracks cached URLs', () => {
    const url = 'https://cdn.shopify.com/s/files/1/1/files/pants.jpg?width=400';
    expect(isImageCached(url)).toBe(false);
    markImageCached(url);
    expect(isImageCached(url)).toBe(true);
  });
});
