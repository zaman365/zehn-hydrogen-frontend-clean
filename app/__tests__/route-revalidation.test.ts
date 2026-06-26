/**
 * UNIT TESTS — route-revalidation.ts (Phase 7B).
 */
import {describe, it, expect} from 'vitest';
import {catalogShouldRevalidate, staticShouldRevalidate} from '~/lib/route-revalidation';

describe('catalogShouldRevalidate', () => {
  const baseArgs = {
    currentParams: {},
    nextParams: {},
  };

  it('revalidates on non-GET mutations', () => {
    expect(
      catalogShouldRevalidate({
        ...baseArgs,
        formMethod: 'POST',
        currentUrl: new URL('https://zehn.test/products/a'),
        nextUrl: new URL('https://zehn.test/products/a'),
        defaultShouldRevalidate: false,
      }),
    ).toBe(true);
  });

  it('revalidates on same-URL manual refresh', () => {
    const url = new URL('https://zehn.test/products/a');
    expect(
      catalogShouldRevalidate({
        ...baseArgs,
        formMethod: 'GET',
        currentUrl: url,
        nextUrl: url,
        defaultShouldRevalidate: false,
      }),
    ).toBe(true);
  });

  it('revalidates on different pathname GET navigation (different handle)', () => {
    // sale → neuheiten: same route file, different params — must reload data
    expect(
      catalogShouldRevalidate({
        ...baseArgs,
        formMethod: 'GET',
        currentUrl: new URL('https://zehn.test/collections/sale'),
        nextUrl: new URL('https://zehn.test/collections/neuheiten'),
        defaultShouldRevalidate: true,
      }),
    ).toBe(true);
  });

  it('skips revalidation on same pathname with different search params (chip filter)', () => {
    // /collections/sale → /collections/sale?category=chinohosen: clientLoader serves from cache
    expect(
      catalogShouldRevalidate({
        ...baseArgs,
        formMethod: 'GET',
        currentUrl: new URL('https://zehn.test/collections/sale'),
        nextUrl: new URL('https://zehn.test/collections/sale?category=chinohosen'),
        defaultShouldRevalidate: false,
      }),
    ).toBe(false);
  });
});

describe('staticShouldRevalidate', () => {
  it('matches catalogShouldRevalidate on GET cross-route navigation', () => {
    const args = {
      currentParams: {},
      nextParams: {},
      formMethod: 'GET' as const,
      currentUrl: new URL('https://zehn.test/pages/faq'),
      nextUrl: new URL('https://zehn.test/blogs'),
      defaultShouldRevalidate: true,
    };
    expect(staticShouldRevalidate(args)).toBe(catalogShouldRevalidate(args));
  });
});
