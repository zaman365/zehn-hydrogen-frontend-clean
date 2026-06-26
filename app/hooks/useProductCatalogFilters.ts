/**
 * Shared catalog filter state — homepage ProductGrid + collection routes (REQ-0008).
 * Client-only facets; instant re-render without URL/query sync.
 */
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useIsomorphicLayoutEffect} from '~/hooks/useIsomorphicLayoutEffect';
import {
  isCatalogBandPath,
  isCatalogRootPath,
  isValidCatalogSearchCategory,
  resolveBandCategoryFromRoute,
} from '~/lib/catalog-band-context';
import {parseCollectionNavPath} from '~/lib/header-nav-active';
import {MAIN_CATEGORY_MAP, resolveAlleCategory} from '~/lib/category-map';
import {productMatchesCategory} from '~/lib/category-match';
import {
  getAvailableFilteredProductValues,
  productMatchesSelectedFilters,
  sortProductsByKey,
  type ProductLike,
  type ProductSortKey,
} from '~/lib/product-filters';
import type {ProductFilterKind} from '~/lib/product-filter-ui';

type Category = string;

export type MainCategoryMap = Map<string, Set<string>>;

export const DEFAULT_MAIN_CATEGORIES: MainCategoryMap = new Map(
  Object.entries(MAIN_CATEGORY_MAP).map(([main, subs]) => [main, new Set(subs)]),
);

function getParentCategory(
  category: Category,
  mainCategories: MainCategoryMap,
): string {
  if (mainCategories.has(category)) return category;

  for (const [mainCategory, subcategories] of mainCategories.entries()) {
    if (subcategories.has(category)) return mainCategory;
  }

  return category;
}

function getActiveMainCategory(
  selectedCategory: Category,
  mainCategories: MainCategoryMap,
): string {
  if (!selectedCategory) return '';
  if (mainCategories.has(selectedCategory)) return selectedCategory;

  for (const [mainCat, subCats] of mainCategories.entries()) {
    if (subCats.has(selectedCategory)) return mainCat;
  }

  return '';
}

function uniqueProducts<T extends ProductLike>(products: T[]): T[] {
  const productMap = new Map<string, T>();

  products.forEach((product) => {
    const key = (product as {id?: string; handle?: string}).id
      ?? (product as {handle?: string}).handle;
    if (key && !productMap.has(key)) {
      productMap.set(key, product);
    }
  });

  return Array.from(productMap.values());
}

/** Route-driven category sync for collection catalog pages (BL-0011). */
export type CatalogRouteSync = {
  pathname: string;
  collectionHandle: string;
  catalogFresh?: boolean;
  searchCategory?: string;
};

type CollectionCatalogOptions = {
  mode: 'collection';
  baseProducts: ProductLike[];
  mainCategories?: MainCategoryMap;
  initialCategory?: string;
  curatedMainToggle?: boolean;
  alwaysShowFacetToolbar?: boolean;
  routeSync?: CatalogRouteSync;
  onCatalogFreshConsumed?: () => void;
};

type HomepageDedicatedProducts = {
  bestsellerProducts?: ProductLike[];
  shortsProducts?: ProductLike[];
  hosenProducts?: ProductLike[];
  topsProducts?: ProductLike[];
  jeansProducts?: ProductLike[];
  jackenProducts?: ProductLike[];
};

type HomepageCatalogOptions = HomepageDedicatedProducts & {
  mode: 'homepage';
  allProducts: ProductLike[];
  mainCategories?: MainCategoryMap;
  hideFacetsForCategory?: (category: Category) => boolean;
};

export type UseProductCatalogFiltersOptions =
  | CollectionCatalogOptions
  | HomepageCatalogOptions;

export function useProductCatalogFilters(options: UseProductCatalogFiltersOptions) {
  const mainCategories = options.mainCategories ?? DEFAULT_MAIN_CATEGORIES;

  const [selectedCategory, setSelectedCategory] = useState<Category>(
    options.mode === 'collection' ? (options.initialCategory ?? '') : '',
  );
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [sortBy, setSortBy] = useState<ProductSortKey>('default');

  const activeMainCategory = useMemo(
    () => getActiveMainCategory(selectedCategory, mainCategories),
    [mainCategories, selectedCategory],
  );

  const categoryProducts = useMemo(() => {
    if (options.mode === 'collection') {
      const effectiveCategory =
        resolveAlleCategory(selectedCategory) || selectedCategory;
      if (!effectiveCategory) return options.baseProducts;

      return options.baseProducts.filter((product) =>
        productMatchesCategory(product, effectiveCategory),
      );
    }

    if (selectedCategory === 'bestseller') {
      const bestseller = options.bestsellerProducts ?? [];
      return bestseller.length > 0 ? bestseller : options.allProducts;
    }

    if (!selectedCategory) return [];

    const parentCategory = getParentCategory(selectedCategory, mainCategories);
    const dedicatedProducts: Record<string, ProductLike[]> = {
      shorts: options.shortsProducts ?? [],
      hosen: options.hosenProducts ?? [],
      jeans: options.jeansProducts ?? [],
      jacken: options.jackenProducts ?? [],
      tops: options.topsProducts ?? [],
    };
    const fallbackProducts = options.allProducts.filter((product) =>
      productMatchesCategory(product, parentCategory),
    );
    const parentProducts = uniqueProducts([
      ...(dedicatedProducts[parentCategory] ?? []),
      ...fallbackProducts,
    ]);

    if (selectedCategory === parentCategory) {
      return parentProducts;
    }

    return parentProducts.filter((product) =>
      productMatchesCategory(product, selectedCategory),
    );
  }, [mainCategories, options, selectedCategory]);

  const availableSizes = useMemo(
    () =>
      getAvailableFilteredProductValues(categoryProducts, 'size', {
        color: selectedColor,
        priceRange: selectedPriceRange,
      }),
    [categoryProducts, selectedColor, selectedPriceRange],
  );

  const availableColors = useMemo(
    () =>
      getAvailableFilteredProductValues(categoryProducts, 'color', {
        size: selectedSize,
        priceRange: selectedPriceRange,
      }),
    [categoryProducts, selectedSize, selectedPriceRange],
  );

  const displayProducts = useMemo(() => {
    const filtered = categoryProducts.filter((product) =>
      productMatchesSelectedFilters(product, {
        size: selectedSize,
        color: selectedColor,
        priceRange: selectedPriceRange,
      }),
    );

    return sortProductsByKey(filtered, sortBy);
  }, [
    categoryProducts,
    selectedColor,
    selectedPriceRange,
    selectedSize,
    sortBy,
  ]);

  const hasSelectedCategory = Boolean(selectedCategory);

  const showFacetToolbar = useMemo(() => {
    if (options.mode === 'collection') {
      // Hide toolbar when the selected category has no products (empty chip was clicked)
      if (selectedCategory && categoryProducts.length === 0) return false;
      return options.alwaysShowFacetToolbar ?? true;
    }

    if (!hasSelectedCategory) return false;
    return options.hideFacetsForCategory
      ? !options.hideFacetsForCategory(selectedCategory)
      : selectedCategory !== 'bestseller';
  }, [hasSelectedCategory, options, selectedCategory, categoryProducts]);

  const handleMainSelect = useCallback(
    (category: Category) => {
      if (options.mode === 'collection' && options.curatedMainToggle) {
        setSelectedCategory((prev) => (prev === category ? '' : category));
        return;
      }

      if (options.mode === 'homepage') {
        setSelectedCategory((prev) => (prev === category ? '' : category));
        return;
      }

      setSelectedCategory(category);
    },
    [options],
  );

  const handleSubSelect = useCallback((subcategory: Category) => {
    setSelectedCategory(subcategory);
  }, []);

  /** Collection main-row Alle — show full page catalog, hide sub-row. */
  const handleMainAlleSelect = useCallback(() => {
    setSelectedCategory('');
  }, []);

  const handleRemoveChip = useCallback((kind: ProductFilterKind) => {
    switch (kind) {
      case 'price':
        setSelectedPriceRange('');
        break;
      case 'size':
        setSelectedSize('');
        break;
      case 'color':
        setSelectedColor('');
        break;
    }
  }, []);

  const handleClearFacets = useCallback(() => {
    setSelectedSize('');
    setSelectedColor('');
    setSelectedPriceRange('');
  }, []);

  useEffect(() => {
    if (!showFacetToolbar) {
      setSelectedSize('');
      setSelectedColor('');
      setSelectedPriceRange('');
      setSortBy('default');
    }
  }, [showFacetToolbar]);

  const clearFacetState = useCallback(() => {
    setSelectedSize('');
    setSelectedColor('');
    setSelectedPriceRange('');
    setSortBy('default');
  }, []);

  const prevCatalogRootRef = useRef<string | null>(null);
  const onFreshConsumedRef = useRef<(() => void) | undefined>(undefined);

  const routeSync =
    options.mode === 'collection' ? options.routeSync : undefined;
  onFreshConsumedRef.current =
    options.mode === 'collection' ? options.onCatalogFreshConsumed : undefined;

  // Stable ref so the effect can read the latest routeSync without it being a dep.
  // routeSync is an inline object literal in route components → new reference every render →
  // using it as a dep would fire the effect every render → resetToFreshCatalog() on every chip click.
  const routeSyncRef = useRef(routeSync);
  routeSyncRef.current = routeSync;

  // Primitive deps: effect fires only when the route actually changes, not on every render.
  const rsPathname = routeSync?.pathname ?? null;
  const rsHandle = routeSync?.collectionHandle ?? null;
  const rsFresh = routeSync?.catalogFresh ?? false;
  const rsSearchCategory = routeSync?.searchCategory ?? null;

  /* Collection route → chip sync; useIsomorphicLayoutEffect runs before paint → no stale-state flash (BL-0017). */
  useIsomorphicLayoutEffect(() => {
    const rs = routeSyncRef.current;
    if (!rs) return;

    const {pathname, collectionHandle, catalogFresh, searchCategory} = rs;
    const parsed = parseCollectionNavPath(pathname);
    const catalogRoot = parsed.rootSlug;
    const isRoot = isCatalogRootPath(pathname);
    const isBand = isCatalogBandPath(pathname);
    /** Catalog roots are band paths but must reset to main Alle on navbar land (BL-0017). */
    const isBandLeaf = isBand && !isRoot;

    const applySearchCategory = () => {
      const requested = (searchCategory ?? '').toLowerCase().trim();
      if (
        !requested ||
        !isValidCatalogSearchCategory(requested, mainCategories)
      ) {
        return;
      }
      setSelectedCategory(requested);
    };

    const resetToFreshCatalog = () => {
      setSelectedCategory('');
      clearFacetState();
    };

    /** Sync main/sub chips from band URL — used for leaf + alle-* lands. */
    const syncBandCategoryFromRoute = (): boolean => {
      const category = resolveBandCategoryFromRoute(pathname, collectionHandle);
      if (!category) return false;
      clearFacetState();
      setSelectedCategory(category);
      return true;
    };

    if (catalogFresh) {
      onFreshConsumedRef.current?.();
      if (isRoot) {
        resetToFreshCatalog();
        applySearchCategory();
      } else if (isBandLeaf) {
        syncBandCategoryFromRoute();
      } else {
        resetToFreshCatalog();
      }
      if (catalogRoot) prevCatalogRootRef.current = catalogRoot;
      return;
    }

    if (
      catalogRoot &&
      prevCatalogRootRef.current &&
      prevCatalogRootRef.current !== catalogRoot
    ) {
      if (isBandLeaf) {
        syncBandCategoryFromRoute();
      } else {
        resetToFreshCatalog();
        if (isRoot) applySearchCategory();
      }
      prevCatalogRootRef.current = catalogRoot;
      return;
    }

    if (isRoot) {
      resetToFreshCatalog();
      applySearchCategory();
      if (catalogRoot) prevCatalogRootRef.current = catalogRoot;
      return;
    }

    if (isBandLeaf) {
      syncBandCategoryFromRoute();
      if (catalogRoot) prevCatalogRootRef.current = catalogRoot;
      return;
    }

    if (catalogRoot) prevCatalogRootRef.current = catalogRoot;
  }, [
    clearFacetState,
    mainCategories,
    rsPathname,
    rsHandle,
    rsFresh,
    rsSearchCategory,
    setSelectedCategory,
  ]);

  // Stable reference — from loader data, changes only on navigation (not on every render).
  const baseProducts = options.mode === 'collection' ? options.baseProducts : null;

  /**
   * Per-category product count for the base product set of this route.
   * undefined on homepage (no dimming needed); stable dep avoids recompute every render.
   */
  const categoryCounts = useMemo<Map<string, number> | undefined>(() => {
    if (!baseProducts) return undefined;
    const counts = new Map<string, number>();
    for (const [main, subs] of mainCategories) {
      counts.set(main, baseProducts.filter((p) => productMatchesCategory(p, main)).length);
      for (const sub of subs) {
        counts.set(sub, baseProducts.filter((p) => productMatchesCategory(p, sub)).length);
      }
    }
    return counts;
  }, [mainCategories, baseProducts]);

  return {
    mainCategories,
    selectedCategory,
    setSelectedCategory,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    selectedPriceRange,
    setSelectedPriceRange,
    sortBy,
    setSortBy,
    activeMainCategory,
    categoryProducts,
    availableSizes,
    availableColors,
    displayProducts,
    hasSelectedCategory,
    showFacetToolbar,
    handleMainSelect,
    handleSubSelect,
    handleMainAlleSelect,
    handleRemoveChip,
    handleClearFacets,
    categoryCounts,
  };
}

export type ProductCatalogFilterState = ReturnType<typeof useProductCatalogFilters>;
