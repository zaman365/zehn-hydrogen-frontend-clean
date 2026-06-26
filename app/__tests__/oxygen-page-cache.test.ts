/**
 * UNIT TESTS — oxygen-page-cache.ts (Phase 7A).
 */
import {describe, it, expect} from 'vitest';
import {getOxygenPageCacheHeaders} from '~/lib/oxygen-page-cache';

describe('oxygen-page-cache', () => {
  it('sets Oxygen-Cache-Control for catalog policy', () => {
    const headers = getOxygenPageCacheHeaders('catalog') as Record<string, string>;
    expect(headers['Oxygen-Cache-Control']).toContain('public');
    expect(headers['Oxygen-Cache-Control']).toContain('max-age=3600');
    expect(headers['Oxygen-Cache-Control']).toContain('stale-while-revalidate=86400');
  });

  it('sets long cache for static policy', () => {
    const headers = getOxygenPageCacheHeaders('static') as Record<string, string>;
    expect(headers['Oxygen-Cache-Control']).toContain('max-age=3600');
  });

  it('uses no-store for none policy', () => {
    const headers = getOxygenPageCacheHeaders('none') as Record<string, string>;
    expect(headers['Cache-Control']).toContain('no-store');
  });
});
