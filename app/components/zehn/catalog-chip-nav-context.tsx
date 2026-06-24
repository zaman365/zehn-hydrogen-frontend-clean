/**
 * Live catalog chip state for header/mobile menu sync (BL-0017).
 * Published by ProductCatalogBand; consumed by Header — no URL on filter-chip roots.
 */
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type CatalogChipNavSource = 'idle' | 'homepage' | 'collection';

export type CatalogChipNavSnapshot = {
  source: CatalogChipNavSource;
  /** shop-all | neuheiten | bestseller | sale */
  rootSlug: string | null;
  selectedCategory: string;
  activeMainCategory: string;
};

const IDLE_SNAPSHOT: CatalogChipNavSnapshot = {
  source: 'idle',
  rootSlug: null,
  selectedCategory: '',
  activeMainCategory: '',
};

type CatalogChipNavContextValue = {
  snapshot: CatalogChipNavSnapshot;
  publish: (next: CatalogChipNavSnapshot) => void;
  clear: () => void;
};

const CatalogChipNavContext = createContext<CatalogChipNavContextValue | null>(
  null,
);

export function CatalogChipNavProvider({children}: {children: ReactNode}) {
  const [snapshot, setSnapshot] = useState<CatalogChipNavSnapshot>(IDLE_SNAPSHOT);

  const publish = useCallback((next: CatalogChipNavSnapshot) => {
    setSnapshot(next);
  }, []);

  const clear = useCallback(() => {
    setSnapshot(IDLE_SNAPSHOT);
  }, []);

  const value = useMemo(
    () => ({
      snapshot,
      publish,
      clear,
    }),
    [clear, publish, snapshot],
  );

  return (
    <CatalogChipNavContext.Provider value={value}>
      {children}
    </CatalogChipNavContext.Provider>
  );
}

export function useCatalogChipNav(): CatalogChipNavSnapshot {
  const ctx = useContext(CatalogChipNavContext);
  return ctx?.snapshot ?? IDLE_SNAPSHOT;
}

/** Publish before paint so header menu reads current chip on same frame (BL-0017). */
export function usePublishCatalogChipNav(snapshot: CatalogChipNavSnapshot): void {
  const ctx = useContext(CatalogChipNavContext);

  useLayoutEffect(() => {
    if (!ctx) return;
    ctx.publish(snapshot);
  }, [
    ctx,
    ctx?.publish,
    snapshot.activeMainCategory,
    snapshot.rootSlug,
    snapshot.selectedCategory,
    snapshot.source,
  ]);
}
