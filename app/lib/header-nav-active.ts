/**
 * Header / mobile drawer nav active-state helpers.
 * REQ-0008: exact match for leaf links; descendant match for accordion rows;
 * `all` ↔ `shop-all` root normalization via getCollectionRootSlug.
 */
import {
  ALLE_PARENT_MAP,
  getCategoryLabel,
  getCollectionRootSlug,
} from '~/lib/category-map';

export type NavActiveMatchMode = 'exact' | 'descendant';

export type ParsedCollectionNavPath = {
  /** Canonical root: shop-all | neuheiten | bestseller | sale */
  rootSlug: string | null;
  /** e.g. alle-hosen */
  alleParent: string | null;
  /** e.g. chinohosen */
  subHandle: string | null;
};

export type MobileNavOpenState = {
  /** Normalized menu item url key (matches openMobileCollection state) */
  collectionMenuUrl: string | null;
  /** Section title e.g. HOSEN — matches CATEGORY_MENU_SECTIONS.title */
  sectionTitle: string | null;
};

export type NavMenuEntry = {
  url: string;
};

const KNOWN_COLLECTION_ROOTS = new Set([
  'shop-all',
  'all',
  'neuheiten',
  'new-arrival',
  'bestseller',
  'sale',
]);

const EMPTY_PARSED: ParsedCollectionNavPath = {
  rootSlug: null,
  alleParent: null,
  subHandle: null,
};

/**
 * Strict parse for header nav collection trees.
 * Unknown `/collections/{handle}` marketing pages return rootSlug null (no false shop-all match).
 */
export function parseCollectionNavPath(pathname: string): ParsedCollectionNavPath {
  if (!pathname.startsWith('/collections/')) return EMPTY_PARSED;

  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] !== 'collections' || !segments[1]) return EMPTY_PARSED;

  const seg1 = segments[1];
  const seg2 = segments[2] ?? null;
  const seg3 = segments[3] ?? null;

  if (seg1.startsWith('alle-')) {
    return {
      rootSlug: 'shop-all',
      alleParent: seg1,
      subHandle: seg2,
    };
  }

  if (!KNOWN_COLLECTION_ROOTS.has(seg1)) return EMPTY_PARSED;

  const rootSlug = getCollectionRootSlug(`/collections/${seg1}`);

  if (seg2?.startsWith('alle-')) {
    return {
      rootSlug,
      alleParent: seg2,
      subHandle: seg3,
    };
  }

  return {
    rootSlug,
    alleParent: null,
    subHandle: null,
  };
}

/**
 * Leaf links: exact pathname only.
 * Accordion rows: exact or strict child prefix (`linkUrl/`).
 */
export function isNavLinkActive(
  pathname: string,
  linkUrl: string,
  mode: NavActiveMatchMode,
): boolean {
  if (!linkUrl) return false;
  if (mode === 'exact') return pathname === linkUrl;
  if (pathname === linkUrl) return true;
  return pathname.startsWith(`${linkUrl}/`);
}

/**
 * Top-level collection menu item (Kollektion, NEUHEITEN, …).
 * Treats `/collections/all` and `/collections/shop-all/…` as the same root.
 */
export function isNavCollectionRootActive(
  pathname: string,
  menuUrl: string,
): boolean {
  if (!menuUrl) return false;
  if (pathname === menuUrl) return true;

  const parsed = parseCollectionNavPath(pathname);
  if (!parsed.rootSlug) return false;

  const menuRoot = getCollectionRootSlug(menuUrl);
  return parsed.rootSlug === menuRoot;
}

/**
 * Derives which mobile collection accordion + section to open for the current route.
 */
export function resolveMobileNavOpenState(
  pathname: string,
  menuEntries: NavMenuEntry[],
): MobileNavOpenState {
  const parsed = parseCollectionNavPath(pathname);
  if (!parsed.rootSlug) {
    return {collectionMenuUrl: null, sectionTitle: null};
  }

  let collectionMenuUrl: string | null = null;
  for (const entry of menuEntries) {
    if (isNavCollectionRootActive(pathname, entry.url)) {
      collectionMenuUrl = entry.url;
      break;
    }
  }

  let sectionTitle: string | null = null;
  if (parsed.alleParent && parsed.alleParent in ALLE_PARENT_MAP) {
    const mainCategory = ALLE_PARENT_MAP[parsed.alleParent];
    sectionTitle = getCategoryLabel(mainCategory);
  }

  return {collectionMenuUrl, sectionTitle};
}
