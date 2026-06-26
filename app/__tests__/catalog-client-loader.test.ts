/**
 * UNIT TESTS — catalog-client-loader.ts (Phase 7.1E).
 */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {catalogClientLoader} from '~/lib/catalog-client-loader';
import {
  clearClientLoaderCache,
  readClientLoaderCache,
} from '~/lib/client-loader-cache';

describe('catalogClientLoader', () => {
  beforeEach(() => {
    clearClientLoaderCache();
  });

  it('returns cached data without calling serverLoader', async () => {
    const serverLoader = vi.fn().mockResolvedValue({products: []});
    const request = new Request('https://zehn.test/collections/all');

    const first = await catalogClientLoader({request, serverLoader, params: {}, context: {}} as any);
    expect(serverLoader).toHaveBeenCalledTimes(1);

    const second = await catalogClientLoader({request, serverLoader, params: {}, context: {}} as any);
    expect(serverLoader).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it('uses request.url as cache key', async () => {
    const serverLoader = vi.fn().mockResolvedValue({ok: true});
    await catalogClientLoader({
      request: new Request('https://zehn.test/products/a'),
      serverLoader,
      params: {},
      context: {},
    } as any);

    expect(readClientLoaderCache('/products/a')).toEqual({ok: true});
  });
});
