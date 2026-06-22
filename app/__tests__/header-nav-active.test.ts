import {describe, expect, it} from 'vitest';
import {
  isNavCollectionRootActive,
  isNavLinkActive,
  parseCollectionNavPath,
  resolveMobileNavOpenState,
} from '~/lib/header-nav-active';

const CHINO_PATH =
  '/collections/shop-all/alle-hosen/chinohosen';
const ALLE_HOSEN_PATH = '/collections/shop-all/alle-hosen';
const MENU_ENTRIES = [
  {url: '/collections/all'},
  {url: '/collections/neuheiten'},
  {url: '/collections/bestseller'},
  {url: '/collections/sale'},
];

describe('parseCollectionNavPath', () => {
  it('parses shop-all nested path', () => {
    expect(parseCollectionNavPath(CHINO_PATH)).toEqual({
      rootSlug: 'shop-all',
      alleParent: 'alle-hosen',
      subHandle: 'chinohosen',
    });
  });

  it('parses legacy alle-* path', () => {
    expect(parseCollectionNavPath('/collections/alle-hosen/chinohosen')).toEqual(
      {
        rootSlug: 'shop-all',
        alleParent: 'alle-hosen',
        subHandle: 'chinohosen',
      },
    );
  });

  it('returns null root for unknown collection handle', () => {
    expect(parseCollectionNavPath('/collections/foo')).toEqual({
      rootSlug: null,
      alleParent: null,
      subHandle: null,
    });
  });
});

describe('isNavLinkActive', () => {
  it('exact: chinohosen active, alle-hosen not', () => {
    expect(
      isNavLinkActive(CHINO_PATH, ALLE_HOSEN_PATH, 'exact'),
    ).toBe(false);
    expect(
      isNavLinkActive(CHINO_PATH, CHINO_PATH, 'exact'),
    ).toBe(true);
  });

  it('descendant: section row active on chinohosen path', () => {
    expect(
      isNavLinkActive(CHINO_PATH, ALLE_HOSEN_PATH, 'descendant'),
    ).toBe(true);
  });
});

describe('isNavCollectionRootActive', () => {
  it('shop-all subtree matches Kollektion menu /collections/all', () => {
    expect(
      isNavCollectionRootActive(CHINO_PATH, '/collections/all'),
    ).toBe(true);
  });

  it('neuheiten subtree matches neuheiten menu', () => {
    expect(
      isNavCollectionRootActive(
        '/collections/neuheiten/alle-hosen/chinohosen',
        '/collections/neuheiten',
      ),
    ).toBe(true);
  });

  it('unknown collection does not match Kollektion', () => {
    expect(
      isNavCollectionRootActive('/collections/foo', '/collections/all'),
    ).toBe(false);
  });
});

describe('resolveMobileNavOpenState', () => {
  it('resolves Kollektion url and HOSEN section', () => {
    expect(resolveMobileNavOpenState(CHINO_PATH, MENU_ENTRIES)).toEqual({
      collectionMenuUrl: '/collections/all',
      sectionTitle: 'HOSEN',
    });
  });

  it('returns null on non-collection routes', () => {
    expect(resolveMobileNavOpenState('/', MENU_ENTRIES)).toEqual({
      collectionMenuUrl: null,
      sectionTitle: null,
    });
  });
});
