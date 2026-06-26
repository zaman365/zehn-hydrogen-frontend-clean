/**
 * Shared React Router shouldRevalidate strategies — Phase 7 loader dedup.
 *
 * catalogShouldRevalidate:
 *  • Non-GET mutations → always reload (cart, form submit).
 *  • Same URL (useRevalidator) → reload (catalog version bump after merchant CRUD).
 *  • Different pathname → reload (different collection/product handle, must fetch new data).
 *  • Same pathname + different search params → SKIP (chip filter / ?category= / sort;
 *    clientLoader serves from in-memory cache so the page feels instant).
 *
 * This ensures curated collections (sale/neuheiten/bestseller) each load their own
 * data when navigated to — they share the same collections.$handle route so React Router
 * calls shouldRevalidate between them. Returning false there caused stale data bleed.
 */
import type {ShouldRevalidateFunction} from 'react-router';

/** Catalog/commerce routes: PDP, PLP, homepage, collections/all. */
export const catalogShouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  if (formMethod && formMethod !== 'GET') return true;
  // useRevalidator() — explicit refresh (catalog version bump after merchant CRUD)
  if (currentUrl.toString() === nextUrl.toString()) return true;
  // Different pathname = different handle (sale → neuheiten, etc.) — must fetch new data
  if (currentUrl.pathname !== nextUrl.pathname) return true;
  // Same pathname, only search params changed (chip filter, ?category=, sort) — skip server call;
  // clientLoader in-memory cache serves instantly
  return false;
};

/**
 * Static CMS/blog/policy pages — same GET-nav skip as catalog.
 * Async catalog version checks live in useCatalogCacheRevalidation, not here.
 */
export const staticShouldRevalidate: ShouldRevalidateFunction =
  catalogShouldRevalidate;
