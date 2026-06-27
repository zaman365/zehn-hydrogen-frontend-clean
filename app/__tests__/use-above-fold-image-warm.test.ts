/**
 * UNIT TESTS — useAboveFoldImageWarm hook (collection cold-visit image warm).
 */
import {describe, expect, it} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {collectFeaturedImageUrls} from '~/lib/zehn-image-warm';

const ROOT = path.resolve(__dirname, '../..');

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf-8');
}

describe('useAboveFoldImageWarm — module shape', () => {
  const hook = read('app/hooks/useAboveFoldImageWarm.ts');

  it('exports useAboveFoldImageWarm function', () => {
    expect(hook).toContain('export function useAboveFoldImageWarm');
  });

  it('uses useIsomorphicLayoutEffect for pre-paint warm', () => {
    expect(hook).toContain('useIsomorphicLayoutEffect');
  });

  it('delegates to warmImageUrls and collectFeaturedImageUrls', () => {
    expect(hook).toContain('warmImageUrls');
    expect(hook).toContain('collectFeaturedImageUrls');
  });

  it('defaults limit to ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT', () => {
    expect(hook).toContain('ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT');
  });

  it('exports useWarmImageUrls for explicit URL lists', () => {
    expect(hook).toContain('export function useWarmImageUrls');
  });
});

describe('useWarmImageUrls — HomepageProductSliders wiring', () => {
  it('HomepageProductSliders uses useWarmImageUrls, not inline useEffect warm', () => {
    const src = read('app/components/zehn/HomepageProductSliders.tsx');
    expect(src).toContain('useWarmImageUrls');
    expect(src).toContain('useWarmImageUrls(warmUrls)');
    expect(src).not.toContain('warmImageUrls(warmUrls)');
    expect(src).not.toMatch(/useEffect\(\(\) => \{\s*\n\s*warmImageUrls/);
  });
});

describe('useAboveFoldImageWarm — route wiring', () => {
  it('collections.all.tsx uses the shared hook', () => {
    const src = read('app/routes/collections.all.tsx');
    expect(src).toContain('useAboveFoldImageWarm');
    expect(src).toContain('useAboveFoldImageWarm(products.nodes)');
    expect(src).not.toContain('warmImageUrls(collectFeaturedImageUrls');
  });

  it('collections.$handle.tsx uses the shared hook', () => {
    const src = read('app/routes/collections.$handle.tsx');
    expect(src).toContain('useAboveFoldImageWarm');
    expect(src).toContain('useAboveFoldImageWarm(collection.products.nodes)');
    expect(src).not.toContain('warmImageUrls(collectFeaturedImageUrls');
  });
});

describe('useAboveFoldImageWarm — warm slice contract', () => {
  it('collectFeaturedImageUrls respects above-fold slice', () => {
    const products = Array.from({length: 12}, (_, i) => ({
      featuredImage: {url: `https://cdn.example.com/p${i}.jpg`},
    }));
    const urls = collectFeaturedImageUrls(products.slice(0, 8));
    expect(urls).toHaveLength(8);
    expect(urls[0]).toBe('https://cdn.example.com/p0.jpg');
    expect(urls[7]).toBe('https://cdn.example.com/p7.jpg');
  });
});
