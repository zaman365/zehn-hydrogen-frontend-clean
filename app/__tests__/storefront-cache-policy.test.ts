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
// Homepage (_index.tsx) — CACHE_CATALOG (Phase 7)
// ============================================================================
describe('_index.tsx — CACHE_CATALOG applied', () => {
  const src = read('app/routes/_index.tsx');

  it('imports getCachePolicy and CACHE_CATALOG', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_CATALOG');
  });

  it('passes cache to HOMEPAGE_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(storefront, CACHE_CATALOG)');
  });

  it('returns Oxygen page cache headers', () => {
    expect(src).toContain('getOxygenPageCacheHeaders');
  });
});

// ============================================================================
// collections.all.tsx — CACHE_CATALOG
// ============================================================================
describe('collections.all.tsx — CACHE_CATALOG applied', () => {
  const src = read('app/routes/collections.all.tsx');

  it('imports getCachePolicy and CACHE_CATALOG', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_CATALOG');
  });

  it('passes cache to CATALOG_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(storefront, CACHE_CATALOG)');
  });
});

// ============================================================================
// collections.$handle.tsx — CACHE_CATALOG
// ============================================================================
describe('collections.$handle.tsx — CACHE_CATALOG applied', () => {
  const src = read('app/routes/collections.$handle.tsx');

  it('imports getCachePolicy and CACHE_CATALOG', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_CATALOG');
  });

  it('passes cache to COLLECTION_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(storefront, CACHE_CATALOG)');
  });
});

// ============================================================================
// collections.$parent.$sub.tsx — CACHE_SHORT
// ============================================================================
describe('collections.$parent.$sub.tsx — redirect-only loader', () => {
  const src = read('app/routes/collections.$parent.$sub.tsx');

  it('uses redirect (no Shopify query — eliminates duplicate server call)', () => {
    expect(src).toContain('redirect(');
    // No Shopify storefront query — caching moved to /collections/all
    expect(src).not.toContain('context.storefront.query');
  });

  it('redirects to /collections/all with ?category= param', () => {
    expect(src).toContain('/collections/all?category=');
  });
});

// ============================================================================
// collections.$root.$parent.$sub.tsx — redirect-only loader
// ============================================================================
describe('collections.$root.$parent.$sub.tsx — redirect-only loader', () => {
  const src = read('app/routes/collections.$root.$parent.$sub.tsx');

  it('uses redirect (no Shopify query — eliminates duplicate server call)', () => {
    expect(src).toContain('redirect(');
    // No Shopify storefront query — caching moved to /collections/all
    expect(src).not.toContain('context.storefront.query');
  });

  it('redirects to /collections/all with ?category= param', () => {
    expect(src).toContain('/collections/all?category=');
  });
});

// ============================================================================
// products.$handle.tsx — CACHE_CATALOG (PDP + recommended)
// ============================================================================
describe('products.$handle.tsx — CACHE_CATALOG applied', () => {
  const src = read('app/routes/products.$handle.tsx');

  it('imports getCachePolicy and CACHE_CATALOG', () => {
    expect(src).toContain('getCachePolicy');
    expect(src).toContain('CACHE_CATALOG');
  });

  it('passes cache to PRODUCT_QUERY', () => {
    expect(src).toContain('cache: getCachePolicy(storefront, CACHE_CATALOG)');
  });

  it('defers recommended products via promise', () => {
    expect(src).toContain('recommendedProducts');
    expect(src).toContain('<Await resolve={recommendedProducts}');
  });

  it('meta() emits image preload with lowercase fetchpriority (BL-0020 fix)', () => {
    const metaBlock = src.slice(src.indexOf('export const meta'), src.indexOf('export async function loader'));
    // SSR preload restored — fires from <head> before <body> parse on cold visits
    expect(metaBlock).toContain("rel: 'preload'");
    // Must use lowercase HTML attribute — camelCase fetchPriority causes React 18 warning
    expect(metaBlock).toContain('fetchpriority');
    expect(metaBlock).not.toContain('fetchPriority');
    // useScopedImagePreload still used for SPA navigation + color-variant switches
    expect(src).toContain('useScopedImagePreload');
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
