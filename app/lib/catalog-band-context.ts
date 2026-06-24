/**
 * Catalog band context — 4-page filter chip nav vs standalone category link nav (REQ-0007 / BL-0011).
 * Catalog band: shop-all, neuheiten, bestseller, sale (+ nested alle-* / leaf paths).
 * Standalone `/collections/{category}` keeps link nav without main-row Alle.
 */
import {
  MAIN_CATEGORY_MAP,
  isMainCategory,
  resolveAlleCategory,
} from '~/lib/category-map';
import type {CollectionPageContext} from '~/lib/category-section-copy';
import {parseCollectionNavPath} from '~/lib/header-nav-active';

/** Header Link state — top navbar catalog titles reset filter chips on land. */
export const CATALOG_FRESH_NAV_STATE = {catalogFresh: true} as const;

export type CatalogFreshNavState = typeof CATALOG_FRESH_NAV_STATE;

/** Catalog navbar root paths that reset filter chips on land (BL-0011 / BL-0017). */
export const CATALOG_FRESH_NAV_PATHS = new Set([
  '/collections/all',
  '/collections/neuheiten',
  '/collections/new-arrival',
  '/collections/bestseller',
  '/collections/sale',
]);

/**
 * Normalize menu / link URL to a catalog pathname for fresh-nav matching.
 * Strips domain, query, hash, and trailing slash.
 */
export function normalizeCatalogNavPath(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  let path = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      path = new URL(trimmed).pathname;
    } catch {
      return '';
    }
  } else {
    const queryIdx = path.indexOf('?');
    const hashIdx = path.indexOf('#');
    const end = Math.min(
      queryIdx === -1 ? path.length : queryIdx,
      hashIdx === -1 ? path.length : hashIdx,
    );
    path = path.slice(0, end);
  }

  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
}

/** Whether a menu URL should attach catalogFresh navigation state. */
export function isCatalogFreshNavUrl(url: string): boolean {
  return CATALOG_FRESH_NAV_PATHS.has(normalizeCatalogNavPath(url));
}

/** React Router `to` for KOLLEKTION / NEUHEITEN / BESTSELLER / SALE root links. */
export function toCatalogFreshNav(pathname: string) {
  const normalized = normalizeCatalogNavPath(pathname);
  return {
    pathname: normalized || pathname,
    search: '',
    state: CATALOG_FRESH_NAV_STATE,
  };
}

/** True for catalog marketing roots only (no alle-* or leaf segments). */
export function isCatalogRootPath(pathname: string): boolean {
  const parsed = parseCollectionNavPath(pathname);
  if (!parsed.rootSlug) return false;
  return !parsed.alleParent && !parsed.subHandle;
}

/** True for any route under the four catalog roots (incl. menu leaf paths). */
export function isCatalogBandPath(pathname: string): boolean {
  return parseCollectionNavPath(pathname).rootSlug !== null;
}

/** Map pathname root slug → collection band page context for header copy. */
export function resolveCatalogPageContext(
  pathname: string,
): CollectionPageContext | undefined {
  const rootSlug = parseCollectionNavPath(pathname).rootSlug;
  if (!rootSlug) return undefined;

  switch (rootSlug) {
    case 'shop-all':
      return 'shop-all';
    case 'neuheiten':
      return 'neuheiten';
    case 'bestseller':
      return 'bestseller';
    case 'sale':
      return 'sale';
    default:
      return undefined;
  }
}

/** Collection loader handle → filter chip slug (alle-* or main/sub category). */
export function resolveCategoryFromCollectionHandle(
  handle: string,
): string | null {
  const fromAlle = resolveAlleCategory(handle);
  if (fromAlle) return fromAlle;

  if (isMainCategory(handle)) return handle;

  for (const subs of Object.values(MAIN_CATEGORY_MAP)) {
    if (subs.includes(handle)) return handle;
  }

  return null;
}

/**
 * Band route → chip slug — prefers URL leaf segment, then loader handle (BL-0011).
 * Cross-root menu leaf nav must sync from pathname, not reset to Alle.
 */
export function resolveBandCategoryFromRoute(
  pathname: string,
  collectionHandle: string,
): string | null {
  if (!isCatalogBandPath(pathname)) return null;

  const {subHandle} = parseCollectionNavPath(pathname);
  if (subHandle) return subHandle;

  return resolveCategoryFromCollectionHandle(collectionHandle);
}

/** Whether `?category=` is a known chip slug for the catalog band. */
export function isValidCatalogSearchCategory(
  category: string,
  mainCategories: Map<string, Set<string>>,
): boolean {
  const requested = category.toLowerCase().trim();
  if (!requested) return false;

  const valid = new Set<string>();
  for (const [main, subs] of mainCategories) {
    valid.add(main);
    valid.add(`alle-${main}`);
    for (const sub of subs) valid.add(sub);
  }

  const resolved = resolveAlleCategory(requested);
  if (resolved && valid.has(resolved)) return true;
  return valid.has(requested);
}
