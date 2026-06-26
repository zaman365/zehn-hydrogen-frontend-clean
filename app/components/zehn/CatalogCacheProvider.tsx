/**
 * CatalogCacheProvider — Phase 7D client invalidation wrapper.
 *
 * Mounts useCatalogCacheRevalidation for all catalog routes under PageLayout.
 */
import type {ReactNode} from 'react';
import {useCatalogCacheRevalidation} from '~/hooks/useCatalogCacheRevalidation';

export function CatalogCacheProvider({children}: {children: ReactNode}) {
  useCatalogCacheRevalidation();
  return children;
}
