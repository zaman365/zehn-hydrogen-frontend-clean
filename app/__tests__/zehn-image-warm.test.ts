/**
 * UNIT TESTS — zehn-image-warm.ts catalog loader warm helpers.
 */
import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {extractCatalogProducts, warmCatalogLoaderProducts} from '~/lib/zehn-image-warm';

const ROOT = path.resolve(__dirname, '../..');

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf-8');
}

describe('extractCatalogProducts', () => {
  it('returns nodes from collections.all shape', () => {
    const products = [{featuredImage: {url: 'https://cdn.example.com/a.jpg'}}];
    const data = {products: {nodes: products}};
    expect(extractCatalogProducts(data)).toEqual(products);
  });

  it('returns nodes from collections.$handle shape', () => {
    const products = [{featuredImage: {url: 'https://cdn.example.com/b.jpg'}}];
    const data = {collection: {products: {nodes: products}}};
    expect(extractCatalogProducts(data)).toEqual(products);
  });

  it('returns empty array for unknown loader shapes', () => {
    expect(extractCatalogProducts(null)).toEqual([]);
    expect(extractCatalogProducts({product: {}})).toEqual([]);
    expect(extractCatalogProducts({products: {}})).toEqual([]);
  });
});

describe('warmCatalogLoaderProducts', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'Image',
      class MockImage {
        onload: (() => void) | null = null;
        private _src = '';
        currentSrc = '';
        set src(value: string) {
          this._src = value;
          this.currentSrc = value;
        }
        get src() {
          return this._src;
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not throw for collections.all loader data', () => {
    const products = Array.from({length: 10}, (_, i) => ({
      featuredImage: {url: `https://cdn.example.com/p${i}.jpg`},
    }));

    expect(() =>
      warmCatalogLoaderProducts({products: {nodes: products}}, 8),
    ).not.toThrow();
  });

  it('no-ops when window is undefined (SSR guard)', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error — simulate SSR
    delete globalThis.window;

    expect(() =>
      warmCatalogLoaderProducts({
        products: {nodes: [{featuredImage: {url: 'https://cdn.example.com/x.jpg'}}]},
      }),
    ).not.toThrow();

    globalThis.window = originalWindow;
  });
});

describe('catalog-client-loader — warm wiring', () => {
  it('calls warmCatalogLoaderProducts after cache miss', () => {
    const src = read('app/lib/catalog-client-loader.ts');
    expect(src).toContain('warmCatalogLoaderProducts');
    expect(src).toContain('warmCatalogLoaderProducts(serverData)');
  });
});
