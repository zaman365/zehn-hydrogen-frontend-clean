/**
 * UNIT TESTS — catalog-cache-version.ts (Phase 7D).
 */
import {describe, it, expect} from 'vitest';
import {isCatalogCacheVersionStale} from '~/lib/catalog-cache-version';

describe('catalog-cache-version', () => {
  it('detects stale client version', () => {
    expect(isCatalogCacheVersionStale(100, 200)).toBe(true);
  });

  it('does not revalidate when versions match', () => {
    expect(isCatalogCacheVersionStale(200, 200)).toBe(false);
  });
});
