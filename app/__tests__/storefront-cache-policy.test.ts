/**
 * UNIT TESTS — Phase 4 storefront cache policy (storefront-cache-policy.ts).
 * Verifies the helper module shape and that each route imports/applies the policy.
 */
import {describe, it, expect} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf-8');
}

// ============================================================================
// storefront-cache-policy.ts — module shape
// ============================================================================
describe('storefront-cache-policy — module shape', () => {
  const src = read('app/lib/storefront-cache-policy.ts');

  it('exports CACHE_LONG constant', () => {
    expect(src).toContain("CACHE_LONG = 'long'");
  });

  it('exports CACHE_SHORT constant', () => {
    expect(src).toContain("CACHE_SHORT = 'short'");
  });

  it('exports CACHE_NONE constant', () => {
    expect(src).toContain("CACHE_NONE = 'none'");
  });

  it('exports getCachePolicy function', () => {
    expect(src).toContain('export function getCachePolicy(');
  });

  it('getCachePolicy delegates to storefront.CacheLong()', () => {
    expect(src).toContain('storefront.CacheLong()');
  });

  it('getCachePolicy delegates to storefront.CacheShort()', () => {
    expect(src).toContain('storefront.CacheShort()');
  });

  it('getCachePolicy delegates to storefront.CacheNone()', () => {
    expect(src).toContain('storefront.CacheNone()');
  });

  it('exports CachePolicyKey type', () => {
    expect(src).toContain('CachePolicyKey');
  });
});

// ============================================================================
// Homepage (_index.tsx) — CACHE_SHORT
// ============================================================================
describe('_index.tsx — CACHE_SHORT applied', () => {
  const src = read('app/routes/_index.tsx');

  it('imports getCachePolicy and CACHE_SHORT', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_SHORT');
  });

  it('passes cache to HOMEPAGE_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(storefront, CACHE_SHORT)');
  });
});

// ============================================================================
// collections.all.tsx — CACHE_SHORT
// ============================================================================
describe('collections.all.tsx — CACHE_SHORT applied', () => {
  const src = read('app/routes/collections.all.tsx');

  it('imports getCachePolicy and CACHE_SHORT', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_SHORT');
  });

  it('passes cache to CATALOG_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(storefront, CACHE_SHORT)');
  });
});

// ============================================================================
// collections.$handle.tsx — CACHE_SHORT
// ============================================================================
describe('collections.$handle.tsx — CACHE_SHORT applied', () => {
  const src = read('app/routes/collections.$handle.tsx');

  it('imports getCachePolicy and CACHE_SHORT', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_SHORT');
  });

  it('passes cache to COLLECTION_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(storefront, CACHE_SHORT)');
  });
});

// ============================================================================
// collections.$parent.$sub.tsx — CACHE_SHORT
// ============================================================================
describe('collections.$parent.$sub.tsx — CACHE_SHORT applied', () => {
  const src = read('app/routes/collections.$parent.$sub.tsx');

  it('imports getCachePolicy and CACHE_SHORT', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_SHORT');
  });

  it('passes cache to CATALOG_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(context.storefront, CACHE_SHORT)');
  });
});

// ============================================================================
// collections.$root.$parent.$sub.tsx — CACHE_SHORT
// ============================================================================
describe('collections.$root.$parent.$sub.tsx — CACHE_SHORT applied', () => {
  const src = read('app/routes/collections.$root.$parent.$sub.tsx');

  it('imports getCachePolicy and CACHE_SHORT', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_SHORT');
  });

  it('passes cache to CATALOG_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(context.storefront, CACHE_SHORT)');
  });
});

// ============================================================================
// products.$handle.tsx — CACHE_SHORT (PDP + recommended)
// ============================================================================
describe('products.$handle.tsx — CACHE_SHORT applied', () => {
  const src = read('app/routes/products.$handle.tsx');

  it('imports getCachePolicy and CACHE_SHORT', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_SHORT');
  });

  it('passes cache to PRODUCT_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(storefront, CACHE_SHORT)');
  });
});

// ============================================================================
// search.tsx — CACHE_NONE (user query, never stale)
// ============================================================================
describe('search.tsx — CACHE_NONE applied', () => {
  const src = read('app/routes/search.tsx');

  it('imports getCachePolicy and CACHE_NONE', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_NONE');
  });

  it('passes cache to SEARCH_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(storefront, CACHE_NONE)');
  });

  it('passes cache to PREDICTIVE_SEARCH_QUERY', () => {
    // Multiple CACHE_NONE usages confirm both search paths are covered
    const count = (src.match(/getCachePolicy\(storefront, CACHE_NONE\)/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================================
// pages.$handle.tsx — CACHE_LONG (CMS static pages)
// ============================================================================
describe('pages.$handle.tsx — CACHE_LONG applied', () => {
  const src = read('app/routes/pages.$handle.tsx');

  it('imports getCachePolicy and CACHE_LONG', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_LONG');
  });

  it('passes cache to PAGE_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(context.storefront, CACHE_LONG)');
  });
});

// ============================================================================
// policies.$handle.tsx — CACHE_LONG
// ============================================================================
describe('policies.$handle.tsx — CACHE_LONG applied', () => {
  const src = read('app/routes/policies.$handle.tsx');

  it('imports getCachePolicy and CACHE_LONG', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_LONG');
  });

  it('passes cache to POLICY_CONTENT_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(context.storefront, CACHE_LONG)');
  });
});

// ============================================================================
// policies._index.tsx — CACHE_LONG
// ============================================================================
describe('policies._index.tsx — CACHE_LONG applied', () => {
  const src = read('app/routes/policies._index.tsx');

  it('imports getCachePolicy and CACHE_LONG', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_LONG');
  });

  it('passes cache to POLICIES_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(context.storefront, CACHE_LONG)');
  });
});

// ============================================================================
// blogs.$blogHandle.$articleHandle.tsx — CACHE_LONG
// ============================================================================
describe('blogs.$blogHandle.$articleHandle.tsx — CACHE_LONG applied', () => {
  const src = read('app/routes/blogs.$blogHandle.$articleHandle.tsx');

  it('imports getCachePolicy and CACHE_LONG', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_LONG');
  });

  it('passes cache to ARTICLE_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(context.storefront, CACHE_LONG)');
  });
});

// ============================================================================
// blogs.$blogHandle._index.tsx — CACHE_LONG
// ============================================================================
describe('blogs.$blogHandle._index.tsx — CACHE_LONG applied', () => {
  const src = read('app/routes/blogs.$blogHandle._index.tsx');

  it('imports getCachePolicy and CACHE_LONG', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_LONG');
  });

  it('passes cache to BLOGS_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(context.storefront, CACHE_LONG)');
  });
});

// ============================================================================
// blogs._index.tsx — CACHE_LONG
// ============================================================================
describe('blogs._index.tsx — CACHE_LONG applied', () => {
  const src = read('app/routes/blogs._index.tsx');

  it('imports getCachePolicy and CACHE_LONG', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_LONG');
  });

  it('passes cache to BLOGS_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(context.storefront, CACHE_LONG)');
  });
});

// ============================================================================
// [robots.txt].tsx — CACHE_LONG
// ============================================================================
describe('[robots.txt].tsx — CACHE_LONG applied', () => {
  const src = read('app/routes/[robots.txt].tsx');

  it('imports getCachePolicy and CACHE_LONG', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_LONG');
  });

  it('passes cache to ROBOTS_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(context.storefront, CACHE_LONG)');
  });
});
