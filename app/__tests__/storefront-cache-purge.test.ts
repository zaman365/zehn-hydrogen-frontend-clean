/**
 * UNIT TESTS — app/lib/storefront-cache-purge.ts
 * Verifies module shape, purge key mapping, handle extraction, and cache delete logic.
 */
import {describe, it, expect, vi, beforeEach, beforeAll} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/* caches is a Workers/browser global — not in Node/vitest environment. Stub it here. */
const cachesStub = {
  open: vi.fn(),
};
beforeAll(() => {
  (globalThis as unknown as Record<string, unknown>).caches = cachesStub;
});

const ROOT = path.resolve(__dirname, '../..');
const src = fs.readFileSync(path.join(ROOT, 'app/lib/storefront-cache-purge.ts'), 'utf-8');

// ============================================================================
// Module shape
// ============================================================================
describe('storefront-cache-purge — module shape', () => {
  it('exports getPurgeKeysForWebhook function', () => {
    expect(src).toContain('export function getPurgeKeysForWebhook(');
  });

  it('exports purgeStorefrontCache function', () => {
    expect(src).toContain('export async function purgeStorefrontCache(');
  });

  it('exports extractHandlesFromPurgeKeys function', () => {
    expect(src).toContain('export function extractHandlesFromPurgeKeys(');
  });

  it('exports PURGE_KEYS constants', () => {
    expect(src).toContain('export const PURGE_KEYS');
  });

  it('exports PurgeResult interface', () => {
    expect(src).toContain('export interface PurgeResult');
  });

  it('uses caches.open for hydrogen cache', () => {
    expect(src).toContain("caches.open(");
    expect(src).toContain("'hydrogen'");
  });

  it('handles products/* topics', () => {
    expect(src).toContain("topic.startsWith('products/')");
  });

  it('handles collections/* topics', () => {
    expect(src).toContain("topic.startsWith('collections/')");
  });

  it('uses waitUntil for async purge', () => {
    expect(src).toContain('waitUntil');
  });

  it('encodes handle search pattern via encodeURIComponent', () => {
    expect(src).toContain('encodeURIComponent');
    expect(src).toContain('"handle":"');
  });

  it('accepts logicalKeys for homepage/catalog signature purge', () => {
    expect(src).toContain('logicalKeys');
    expect(src).toContain('STOREFRONT_QUERY_SIGNATURES');
    expect(src).toContain('urlMatchesLogicalKey');
  });

  it('catches and logs errors without throwing', () => {
    expect(src).toContain('console.error');
    expect(src).toContain('[cache-purge]');
  });
});

// ============================================================================
// getPurgeKeysForWebhook
// ============================================================================
describe('getPurgeKeysForWebhook', () => {
  it('returns product + homepage + collections-all for products/update', async () => {
    const {getPurgeKeysForWebhook} = await import('../lib/storefront-cache-purge');
    const keys = getPurgeKeysForWebhook('products/update', 'summer-shirt');
    expect(keys).toContain('product-summer-shirt');
    expect(keys).toContain('homepage');
    expect(keys).toContain('collections-all');
  });

  it('returns product keys for products/create', async () => {
    const {getPurgeKeysForWebhook} = await import('../lib/storefront-cache-purge');
    const keys = getPurgeKeysForWebhook('products/create', 'new-item');
    expect(keys).toContain('product-new-item');
  });

  it('returns product keys for products/delete', async () => {
    const {getPurgeKeysForWebhook} = await import('../lib/storefront-cache-purge');
    const keys = getPurgeKeysForWebhook('products/delete', 'old-item');
    expect(keys).toContain('product-old-item');
    expect(keys.length).toBeGreaterThanOrEqual(2);
  });

  it('returns collection + collections-all for collections/update', async () => {
    const {getPurgeKeysForWebhook} = await import('../lib/storefront-cache-purge');
    const keys = getPurgeKeysForWebhook('collections/update', 'sale');
    expect(keys).toContain('collection-sale');
    expect(keys).toContain('collections-all');
    expect(keys).not.toContain('homepage');
  });

  it('returns collection keys for collections/create', async () => {
    const {getPurgeKeysForWebhook} = await import('../lib/storefront-cache-purge');
    const keys = getPurgeKeysForWebhook('collections/create', 'new-season');
    expect(keys).toContain('collection-new-season');
  });

  it('returns collection keys for collections/delete', async () => {
    const {getPurgeKeysForWebhook} = await import('../lib/storefront-cache-purge');
    const keys = getPurgeKeysForWebhook('collections/delete', 'old-collection');
    expect(keys).toContain('collection-old-collection');
  });

  it('returns empty array for unknown topics', async () => {
    const {getPurgeKeysForWebhook} = await import('../lib/storefront-cache-purge');
    expect(getPurgeKeysForWebhook('orders/create', 'order-123')).toEqual([]);
  });
});

// ============================================================================
// extractHandlesFromPurgeKeys
// ============================================================================
describe('extractHandlesFromPurgeKeys', () => {
  it('extracts handle from product key', async () => {
    const {extractHandlesFromPurgeKeys} = await import('../lib/storefront-cache-purge');
    const handles = extractHandlesFromPurgeKeys(['product-my-shirt', 'homepage']);
    expect(handles).toContain('my-shirt');
    expect(handles).not.toContain('homepage');
  });

  it('extracts handle from collection key', async () => {
    const {extractHandlesFromPurgeKeys} = await import('../lib/storefront-cache-purge');
    const handles = extractHandlesFromPurgeKeys(['collection-summer-sale', 'collections-all']);
    expect(handles).toContain('summer-sale');
    expect(handles).not.toContain('collections-all');
  });

  it('extracts multi-segment handles with hyphens', async () => {
    const {extractHandlesFromPurgeKeys} = await import('../lib/storefront-cache-purge');
    const handles = extractHandlesFromPurgeKeys(['product-my-cool-product-v2']);
    expect(handles).toContain('my-cool-product-v2');
  });

  it('ignores homepage and collections-all keys (no handle)', async () => {
    const {extractHandlesFromPurgeKeys} = await import('../lib/storefront-cache-purge');
    const handles = extractHandlesFromPurgeKeys(['homepage', 'collections-all']);
    expect(handles).toHaveLength(0);
  });

  it('returns empty array for empty input', async () => {
    const {extractHandlesFromPurgeKeys} = await import('../lib/storefront-cache-purge');
    expect(extractHandlesFromPurgeKeys([])).toEqual([]);
  });
});

// ============================================================================
// purgeStorefrontCache — mocked Workers Cache API
// ============================================================================
describe('purgeStorefrontCache — cache operations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty result when no handles provided', async () => {
    const {purgeStorefrontCache} = await import('../lib/storefront-cache-purge');
    const result = await purgeStorefrontCache([]);
    expect(result.purged).toBe(0);
    expect(result.failed).toBe(0);
  });

  it('deletes cache entries matching the handle pattern', async () => {
    /* Simulate a cache with one matching entry and one non-matching */
    const handle = 'summer-shirt';
    const encodedPattern = encodeURIComponent(`"handle":"${handle}"`);
    const matchingUrl = `https://shopify.dev/?${encodedPattern}abc`;
    const otherUrl = 'https://shopify.dev/?encodedOtherQuery';

    const deleted = new Set<string>();
    const mockCache = {
      keys: async () => [new Request(matchingUrl), new Request(otherUrl)],
      delete: async (req: Request) => {
        deleted.add(req.url);
        return true;
      },
    };
    vi.spyOn(caches, 'open').mockResolvedValue(mockCache as unknown as Cache);

    const {purgeStorefrontCache} = await import('../lib/storefront-cache-purge');
    const result = await purgeStorefrontCache([handle]);

    expect(result.purged).toBe(1);
    expect(result.failed).toBe(0);
    expect(deleted.has(matchingUrl)).toBe(true);
    expect(deleted.has(otherUrl)).toBe(false);
  });

  it('skips purge when cache.keys is not available', async () => {
    const mockCache = {/* no keys function */};
    vi.spyOn(caches, 'open').mockResolvedValue(mockCache as unknown as Cache);

    const {purgeStorefrontCache} = await import('../lib/storefront-cache-purge');
    const result = await purgeStorefrontCache(['some-product']);

    expect(result.purged).toBe(0);
    expect(result.failed).toBe(0);
  });

  it('counts failed when cache.delete throws', async () => {
    const handle = 'fail-product';
    const encodedPattern = encodeURIComponent(`"handle":"${handle}"`);
    const matchingUrl = `https://shopify.dev/?${encodedPattern}`;

    const mockCache = {
      keys: async () => [new Request(matchingUrl)],
      delete: async (_req: Request) => {
        throw new Error('delete error');
      },
    };
    vi.spyOn(caches, 'open').mockResolvedValue(mockCache as unknown as Cache);

    const {purgeStorefrontCache} = await import('../lib/storefront-cache-purge');
    const result = await purgeStorefrontCache([handle]);

    expect(result.failed).toBe(1);
    expect(result.purged).toBe(0);
  });

  it('fires waitUntil and returns optimistic result', async () => {
    const mockCache = {
      keys: async () => [],
    };
    vi.spyOn(caches, 'open').mockResolvedValue(mockCache as unknown as Cache);

    const {purgeStorefrontCache} = await import('../lib/storefront-cache-purge');
    const waitUntilSpy = vi.fn();

    const result = await purgeStorefrontCache(['product-handle'], waitUntilSpy);

    expect(waitUntilSpy).toHaveBeenCalledOnce();
    /* Optimistic result: counts are 0, logicalKeys populated */
    expect(result.logicalKeys).toContain('product-handle');
  });
});
