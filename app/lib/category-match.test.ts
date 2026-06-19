import {describe, expect, it} from 'vitest';
import {CATEGORY_LABELS} from './category-map';
import {
  normalizeCategoryHandle,
  productMatchesCategory,
  resolveKnownCategoryHandle,
} from './category-match';

const categoryProducts: Record<
  string,
  {handle: string; title: string; productType: string; tags: string[]}
> = {
  shorts: {
    handle: 'zehn-bermuda-shorts',
    title: 'ZEHN Bermuda Shorts',
    productType: 'Shorts',
    tags: ['shorts', 'kurze hose'],
  },
  'cargo-shorts': {
    handle: 'zehn-utility-cargo-shorts',
    title: 'ZEHN Utility Cargo Shorts',
    productType: 'Cargo Shorts',
    tags: ['cargo', 'shorts'],
  },
  'chino-shorts': {
    handle: 'zehn-harbor-chino-shorts',
    title: 'ZEHN Harbor Chino Shorts',
    productType: 'Chino Shorts',
    tags: ['chino', 'shorts'],
  },
  hosen: {
    handle: 'zehn-signature-hose',
    title: 'ZEHN Signature Hose',
    productType: 'Hosen',
    tags: ['hose', 'pants'],
  },
  cargohosen: {
    handle: 'zehn-premium-cargohose',
    title: 'ZEHN Premium Cargohose',
    productType: 'Cargohose',
    tags: ['cargo', 'hose'],
  },
  chinohosen: {
    handle: 'zehn-signature-chinohose',
    title: 'ZEHN Signature Chinohose',
    productType: 'Chinohose',
    tags: ['chino', 'hose'],
  },
  jeans: {
    handle: 'zehn-rivet-jeans',
    title: 'ZEHN Rivet Jeans',
    productType: 'Jeans',
    tags: ['denim'],
  },
  jacken: {
    handle: 'zehn-falcon-herren-bomberjacke',
    title: 'ZEHN Falcon Herren Bomberjacke',
    productType: 'Jacke',
    tags: ['jacket'],
  },
  uebergangsjacken: {
    handle: 'zehn-falcon-herren-bomberjacke',
    title: 'ZEHN Falcon Herren Übergangsjacke',
    productType: 'Übergangsjacke',
    tags: ['uebergangsjacke', 'herbst'],
  },
  winterjacken: {
    handle: 'zehn-aero-puffer-jacket',
    title: 'ZEHN Aero Winterjacke',
    productType: 'Winterjacke',
    tags: ['winter', 'puffer'],
  },
  tops: {
    handle: 'zehn-core-herren-shirt',
    title: 'ZEHN Core Herren Shirt',
    productType: 'T-Shirt',
    tags: ['shirt', 'top'],
  },
  't-shirts': {
    handle: 'zehn-core-herren-t-shirt',
    title: 'ZEHN Core Herren T-Shirt',
    productType: 'T-Shirt',
    tags: ['tee'],
  },
  poloshirts: {
    handle: 'zehn-contour-herren-poloshirt',
    title: 'ZEHN Contour Herren Poloshirt',
    productType: 'Poloshirt',
    tags: ['polo'],
  },
};

describe('productMatchesCategory', () => {
  it.each(Object.keys(CATEGORY_LABELS))(
    'matches canonical category %s',
    (category) => {
      expect(productMatchesCategory(categoryProducts[category], category)).toBe(
        true,
      );
    },
  );

  it('normalizes umlaut and ascii spellings for uebergangsjacken', () => {
    const product = categoryProducts.uebergangsjacken;

    expect(productMatchesCategory(product, 'uebergangsjacken')).toBe(true);
    expect(productMatchesCategory(product, 'übergangsjacken')).toBe(true);
    expect(productMatchesCategory(product, 'alle-uebergangsjacken')).toBe(true);
  });

  it('keeps winter jackets out of uebergangsjacken', () => {
    expect(
      productMatchesCategory(categoryProducts.winterjacken, 'uebergangsjacken'),
    ).toBe(false);
  });
});

describe('normalizeCategoryHandle', () => {
  it('maps known aliases to canonical category handles', () => {
    expect(normalizeCategoryHandle('Übergangsjacken')).toBe('uebergangsjacken');
    expect(normalizeCategoryHandle('alle-uebergangsjacken')).toBe(
      'uebergangsjacken',
    );
    expect(normalizeCategoryHandle('chinos')).toBe('chinohosen');
    expect(normalizeCategoryHandle('cargos')).toBe('cargohosen');
  });
});

describe('resolveKnownCategoryHandle', () => {
  it('resolves category search terms and rejects non-category product terms', () => {
    expect(resolveKnownCategoryHandle('jeans')).toBe('jeans');
    expect(resolveKnownCategoryHandle('Übergangsjacken')).toBe(
      'uebergangsjacken',
    );
    expect(resolveKnownCategoryHandle('alle-jeans')).toBe('jeans');
    expect(resolveKnownCategoryHandle('baumwolle')).toBeNull();
  });
});
