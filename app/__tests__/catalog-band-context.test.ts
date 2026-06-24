import {describe, expect, it} from 'vitest';
import {
  CATALOG_FRESH_NAV_STATE,
  isCatalogBandPath,
  isCatalogFreshNavUrl,
  isCatalogRootPath,
  normalizeCatalogNavPath,
  resolveBandCategoryFromRoute,
  resolveCatalogPageContext,
  resolveCategoryFromCollectionHandle,
  toCatalogFreshNav,
} from '~/lib/catalog-band-context';

describe('catalog-band-context', () => {
  it('detects catalog root paths', () => {
    expect(isCatalogRootPath('/collections/all')).toBe(true);
    expect(isCatalogRootPath('/collections/neuheiten')).toBe(true);
    expect(isCatalogRootPath('/collections/bestseller')).toBe(true);
    expect(isCatalogRootPath('/collections/sale')).toBe(true);
    expect(isCatalogRootPath('/collections/bestseller/alle-tops')).toBe(false);
    expect(
      isCatalogRootPath('/collections/bestseller/alle-tops/poloshirts'),
    ).toBe(false);
  });

  it('detects catalog band paths incl. menu leaf URLs', () => {
    expect(isCatalogBandPath('/collections/all')).toBe(true);
    expect(
      isCatalogBandPath('/collections/bestseller/alle-tops/poloshirts'),
    ).toBe(true);
    expect(isCatalogBandPath('/collections/alle-hosen/chinohosen')).toBe(true);
    expect(isCatalogBandPath('/collections/hosen')).toBe(false);
  });

  it('resolves page context from pathname root slug', () => {
    expect(resolveCatalogPageContext('/collections/all')).toBe('shop-all');
    expect(resolveCatalogPageContext('/collections/neuheiten')).toBe('neuheiten');
    expect(
      resolveCatalogPageContext('/collections/bestseller/alle-tops/poloshirts'),
    ).toBe('bestseller');
    expect(resolveCatalogPageContext('/collections/hosen')).toBeUndefined();
  });

  it('maps collection handles to filter chip slugs', () => {
    expect(resolveCategoryFromCollectionHandle('alle-poloshirts')).toBe(
      'poloshirts',
    );
    expect(resolveCategoryFromCollectionHandle('tops')).toBe('tops');
    expect(resolveCategoryFromCollectionHandle('bestseller')).toBeNull();
  });

  it('resolves band category from leaf pathname (cross-root menu nav)', () => {
    expect(
      resolveBandCategoryFromRoute(
        '/collections/neuheiten/alle-tops/poloshirts',
        'alle-poloshirts',
      ),
    ).toBe('poloshirts');
    expect(
      resolveBandCategoryFromRoute(
        '/collections/bestseller/alle-jacken',
        'alle-jacken',
      ),
    ).toBe('jacken');
  });

  it('catalog roots are a subset of catalog band paths (BL-0017)', () => {
    const roots = [
      '/collections/all',
      '/collections/neuheiten',
      '/collections/bestseller',
      '/collections/sale',
    ];
    for (const path of roots) {
      expect(isCatalogRootPath(path)).toBe(true);
      expect(isCatalogBandPath(path)).toBe(true);
    }
  });

  it('normalizes catalog nav URLs for fresh-nav matching (BL-0017)', () => {
    expect(normalizeCatalogNavPath('/collections/bestseller/')).toBe(
      '/collections/bestseller',
    );
    expect(
      normalizeCatalogNavPath('https://shop.example/collections/neuheiten?x=1'),
    ).toBe('/collections/neuheiten');
    expect(isCatalogFreshNavUrl('/collections/bestseller/')).toBe(true);
    expect(isCatalogFreshNavUrl('/collections/hosen')).toBe(false);
  });

  it('exports fresh nav state for header links', () => {
    expect(CATALOG_FRESH_NAV_STATE).toEqual({catalogFresh: true});
    expect(toCatalogFreshNav('/collections/bestseller')).toEqual({
      pathname: '/collections/bestseller',
      search: '',
      state: CATALOG_FRESH_NAV_STATE,
    });
  });
});
