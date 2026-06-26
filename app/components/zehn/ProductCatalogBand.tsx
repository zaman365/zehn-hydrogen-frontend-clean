/**
 * Shared catalog band — category nav sub-row + filter toolbar shell (REQ-0007 / REQ-0008).
 * Mirrors homepage ProductGrid layout; collection pages use navVariant="default".
 */
import type {ReactNode, Ref} from 'react';
import {useMemo} from 'react';
import {
  CategoryNavSection,
  type CategoryNavInteraction,
} from '~/components/zehn/CategoryNavSection';
import {ProductFilterToolbar} from '~/components/zehn/ProductFilterToolbar';
import {
  usePublishCatalogChipNav,
  type CatalogChipNavSnapshot,
} from '~/components/zehn/catalog-chip-nav-context';
import {
  CATEGORY_NAV_CATALOG_SHELL,
  CATEGORY_NAV_HOMEPAGE_IDLE_PY,
  CATEGORY_NAV_HOMEPAGE_SHELL,
  CATEGORY_NAV_STACK_GAP,
} from '~/lib/category-nav-styles';
import {CATEGORY_NAV_MAIN_BOTTOM_DIVIDER} from '~/lib/category-nav-sub-styles';
import type {CategorySectionCopy, CollectionPageContext} from '~/lib/category-section-copy';
import {
  getCategorySubRowHint,
  getCollectionBandCopy,
} from '~/lib/category-section-copy';
import type {ProductCatalogFilterState} from '~/hooks/useProductCatalogFilters';
import type {ProductSortKey} from '~/lib/product-filters';
import {cn} from '~/lib/utils';

/** Map collection band page context → catalog root slug for header chip sync. */
function pageContextToRootSlug(
  pageContext: CollectionPageContext | undefined,
): CatalogChipNavSnapshot['rootSlug'] {
  if (!pageContext) return null;
  if (pageContext === 'shop-all') return 'shop-all';
  return pageContext;
}

export type ProductCatalogBandProps = {
  copy?: CategorySectionCopy;
  /** When set, resolves header copy from page context + filter state (collection routes). */
  pageContext?: CollectionPageContext;
  /** Homepage sentence-case titles vs collection uppercase page titles */
  navVariant?: 'homepage' | 'default';
  filterState: ProductCatalogFilterState;
  showFilterToolbar: boolean;
  showMainRow?: boolean;
  curatedMainToggle?: boolean;
  /** Collection catalog pages — main-row Alle chip. */
  showMainAlleChip?: boolean;
  mainInteraction?: CategoryNavInteraction;
  subInteraction?: CategoryNavInteraction;
  getMainHref?: (slug: string) => string;
  getSubHref?: (mainSlug: string, subSlug: string) => string;
  /** Nav chip highlight — may differ from filter selectedCategory on category routes */
  navSelectedCategory?: string;
  /** Sub-row parent — may differ from filter activeMainCategory on category routes */
  navActiveMainCategory?: string;
  subHighlightActive?: boolean;
  menuRef?: Ref<HTMLDivElement>;
  className?: string;
  children?: ReactNode;
};

export function ProductCatalogBand({
  copy: copyProp,
  pageContext,
  navVariant = 'default',
  filterState,
  showFilterToolbar,
  showMainRow = true,
  curatedMainToggle = false,
  showMainAlleChip = false,
  mainInteraction = 'filter',
  subInteraction = 'filter',
  getMainHref,
  getSubHref,
  navSelectedCategory,
  navActiveMainCategory,
  subHighlightActive = true,
  menuRef,
  className,
  children,
}: ProductCatalogBandProps) {
  const {
    mainCategories,
    activeMainCategory,
    selectedCategory,
    selectedPriceRange,
    selectedSize,
    selectedColor,
    availableSizes,
    availableColors,
    sortBy,
    displayProducts,
    handleMainSelect,
    handleSubSelect,
    handleMainAlleSelect,
    handleRemoveChip,
    handleClearFacets,
    setSelectedPriceRange,
    setSelectedSize,
    setSelectedColor,
    setSortBy,
    categoryCounts,
  } = filterState;

  const navMain = navActiveMainCategory ?? activeMainCategory;

  const chipNavSnapshot = useMemo((): CatalogChipNavSnapshot => {
    if (navVariant === 'homepage') {
      return {
        source: 'homepage',
        rootSlug: 'shop-all',
        selectedCategory: navSelectedCategory ?? selectedCategory,
        activeMainCategory: navMain,
      };
    }
    const rootSlug = pageContextToRootSlug(pageContext);
    if (!rootSlug) {
      return {
        source: 'idle',
        rootSlug: null,
        selectedCategory: '',
        activeMainCategory: '',
      };
    }
    return {
      source: 'collection',
      rootSlug,
      selectedCategory: navSelectedCategory ?? selectedCategory,
      activeMainCategory: navMain,
    };
  }, [
    navMain,
    navSelectedCategory,
    navVariant,
    pageContext,
    selectedCategory,
  ]);

  usePublishCatalogChipNav(chipNavSnapshot);

  const showMainBottomDivider =
    navVariant === 'default' && !navMain && showFilterToolbar;

  /** Homepage default — vertical breathing room below trust strip when no category picked. */
  const isHomepageIdle = navVariant === 'homepage' && !navMain;

  const copy =
    copyProp ??
    (pageContext
      ? getCollectionBandCopy(
          pageContext,
          navMain,
          navSelectedCategory ?? selectedCategory,
        )
      : {title: '', subtitle: ''});

  const bandShell =
    navVariant === 'homepage'
      ? CATEGORY_NAV_HOMEPAGE_SHELL
      : CATEGORY_NAV_CATALOG_SHELL;

  return (
    <div
      className={cn(bandShell, isHomepageIdle && CATEGORY_NAV_HOMEPAGE_IDLE_PY, className)}
    >
      <div className={CATEGORY_NAV_STACK_GAP}>
        <CategoryNavSection
          menuRef={menuRef}
          variant={navVariant}
          copy={copy}
          mainCategories={mainCategories}
          activeMainCategory={navMain}
          selectedCategory={navSelectedCategory ?? selectedCategory}
          showMainRow={showMainRow}
          mainInteraction={mainInteraction}
          subInteraction={subInteraction}
          curatedMainToggle={curatedMainToggle}
          onMainSelect={handleMainSelect}
          onSubSelect={handleSubSelect}
          getMainHref={getMainHref}
          getSubHref={getSubHref}
          subcategoriesFor={navMain}
          subPresentation="subRow"
          subChipVariant="main"
          categoryCounts={categoryCounts}
          subRowHint={
            navMain ? getCategorySubRowHint(navMain) : undefined
          }
          showSubAlleChip
          showSubBottomSeparator
          showMainAlleChip={showMainAlleChip}
          onMainAlleSelect={handleMainAlleSelect}
          subHighlightActive={subHighlightActive}
        />

        {showMainBottomDivider && (
          <hr
            className={CATEGORY_NAV_MAIN_BOTTOM_DIVIDER}
            aria-hidden
          />
        )}

        {showFilterToolbar && (
          <ProductFilterToolbar
            selectedPriceRange={selectedPriceRange}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            availableSizes={availableSizes}
            availableColors={availableColors}
            sortBy={sortBy}
            productCount={displayProducts.length}
            onPriceChange={setSelectedPriceRange}
            onSizeChange={setSelectedSize}
            onColorChange={setSelectedColor}
            onSortChange={(value) => setSortBy(value as ProductSortKey)}
            onClear={handleClearFacets}
            onRemoveChip={handleRemoveChip}
          />
        )}
      </div>

      {children}
    </div>
  );
}
