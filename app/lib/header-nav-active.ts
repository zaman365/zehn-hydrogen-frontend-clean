/**
 * Header / mobile drawer nav active-state helpers.
 * REQ-0008: exact match for leaf links; descendant match for accordion rows;
 * `all` ↔ `shop-all` root normalization via getCollectionRootSlug.
 * BL-0017: chip snapshot overrides on catalog roots when filters change without URL.
 */
import {
  ALLE_PARENT_MAP,
  getCategoryLabel,
  getCollectionRootSlug,
} from '~/lib/category-map';
import type {CatalogChipNavSnapshot} from '~/components/zehn/catalog-chip-nav-context';

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
 * Mobile top-level row (KOLLEKTION / NEUHEITEN) — chip root is sole active root when published.
 */
export function isMobileCatalogRootActive(
  pathname: string,
  menuUrl: string,
  chip?: CatalogChipNavSnapshot | null,
): boolean {
  const menuRoot = getCollectionRootSlug(menuUrl);
  if (chip && chip.source !== 'idle' && chip.rootSlug) {
    return chip.rootSlug === menuRoot;
  }
  return isNavCollectionRootActive(pathname, menuUrl);
}

/**
 * Section title for a menu panel — chip filter wins over stale pathname deep segments.
 */
export function resolveChipMenuOpenSection(
  panelRootSlug: string,
  chip?: CatalogChipNavSnapshot | null,
): string | null {
  if (
    !chip ||
    chip.source === 'idle' ||
    chip.rootSlug !== panelRootSlug ||
    !chip.activeMainCategory
  ) {
    return null;
  }
  return getCategoryLabel(chip.activeMainCategory);
}

/**
 * Derives which mobile collection accordion + section to open for the current route.
 * Chip filter state wins over pathname when both share the same catalog root (BL-0017).
 */
export function resolveMobileNavOpenState(
  pathname: string,
  menuEntries: NavMenuEntry[],
  chip?: CatalogChipNavSnapshot | null,
): MobileNavOpenState {
  const parsed = parseCollectionNavPath(pathname);
  if (!parsed.rootSlug && (!chip || chip.source === 'idle')) {
    return {collectionMenuUrl: null, sectionTitle: null};
  }

  const rootForMatch =
    chip && chip.source !== 'idle' && chip.rootSlug
      ? chip.rootSlug
      : (parsed.rootSlug ?? chip?.rootSlug ?? null);

  let collectionMenuUrl: string | null = null;
  if (rootForMatch) {
    for (const entry of menuEntries) {
      if (getCollectionRootSlug(entry.url) === rootForMatch) {
        collectionMenuUrl = entry.url;
        break;
      }
    }
  }

  const chipSection = rootForMatch
    ? resolveChipMenuOpenSection(rootForMatch, chip)
    : null;

  let sectionTitle: string | null = chipSection;
  if (
    !sectionTitle &&
    parsed.alleParent &&
    parsed.alleParent in ALLE_PARENT_MAP &&
    (!chip || chip.source === 'idle' || chip.rootSlug === parsed.rootSlug)
  ) {
    sectionTitle = getCategoryLabel(ALLE_PARENT_MAP[parsed.alleParent]);
  }

  return {collectionMenuUrl, sectionTitle};
}

/**
 * Menu link active — chip filter is source of truth per catalog root (BL-0017).
 */
export function isCatalogMenuLinkActive(
  pathname: string,
  linkUrl: string,
  mode: NavActiveMatchMode,
  chip?: CatalogChipNavSnapshot | null,
): boolean {
  const linkParsed = parseCollectionNavPath(linkUrl);
  if (!linkParsed.rootSlug || !linkParsed.alleParent) {
    return isNavLinkActive(pathname, linkUrl, mode);
  }

  const chipMatchesLinkRoot =
    chip &&
    chip.source !== 'idle' &&
    chip.rootSlug === linkParsed.rootSlug;

  if (!chipMatchesLinkRoot) {
    return isNavLinkActive(pathname, linkUrl, mode);
  }

  const sectionMain = ALLE_PARENT_MAP[linkParsed.alleParent];
  if (!sectionMain) {
    return isNavLinkActive(pathname, linkUrl, mode);
  }

  if (mode === 'descendant') {
    return chip.activeMainCategory === sectionMain;
  }

  if (linkParsed.subHandle) {
    return chip.selectedCategory === linkParsed.subHandle;
  }

  if (chip.activeMainCategory !== sectionMain) return false;
  return !chip.selectedCategory || chip.selectedCategory === sectionMain;
}
