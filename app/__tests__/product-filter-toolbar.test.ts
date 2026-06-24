import {describe, expect, it} from 'vitest';
import {
  getActiveProductFilterChips,
  HOMEPAGE_FILTER_SEPARATOR,
  isProductFilterActive,
  PRODUCT_FILTER_CLEAR_ALL_MIN,
  PRODUCT_SORT_ICONS,
  PRODUCT_SORT_OPTIONS,
} from '~/lib/product-filter-ui';
import {sortProductsByKey} from '~/lib/product-filters';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

describe('product filter toolbar helpers', () => {
  it('builds active facet chips', () => {
    const chips = getActiveProductFilterChips('M', 'Schwarz', '50-100');
    expect(chips).toHaveLength(3);
    expect(chips.map((chip) => chip.kind)).toEqual(['price', 'size', 'color']);
  });

  it('detects active filters', () => {
    expect(isProductFilterActive('', '', '')).toBe(false);
    expect(isProductFilterActive('M', '', '')).toBe(true);
  });

  it('exports shared sort options with icons', () => {
    expect(PRODUCT_SORT_OPTIONS.length).toBeGreaterThanOrEqual(4);
    expect(PRODUCT_SORT_OPTIONS.every((option) => option.icon)).toBe(true);
    expect(PRODUCT_SORT_ICONS.default).toBeDefined();
  });

  it('defines homepage filter separator token', () => {
    expect(HOMEPAGE_FILTER_SEPARATOR).toContain('border-[rgba(15,20,38,0.1)]');
  });

  it('uses product count row styling with icon token', () => {
    const ui = readFile('app/lib/product-filter-ui.ts');
    expect(ui).toMatch(/PRODUCT_SORT_COUNT_ROW[\s\S]*text-foreground\/70/);
    expect(ui).toContain('PRODUCT_COUNT_ICON');
    expect(ui).toContain('Package');
  });

  it('defines desktop clear-all minimum facet count', () => {
    expect(PRODUCT_FILTER_CLEAR_ALL_MIN).toBe(1);
  });

  it('sortProductsByKey orders by price ascending', () => {
    const products = [
      {priceRange: {minVariantPrice: {amount: '100'}}},
      {priceRange: {minVariantPrice: {amount: '50'}}},
    ];
    const sorted = sortProductsByKey(products, 'price-asc');
    expect(sorted[0].priceRange?.minVariantPrice?.amount).toBe('50');
  });
});

describe('product filter toolbar wiring', () => {
  it('ProductGrid uses ProductCatalogBand without mobile drawer', () => {
    const grid = readFile('app/components/zehn/ProductGrid.tsx');
    expect(grid).toContain('ProductCatalogBand');
    expect(grid).toContain('useProductCatalogFilters');
    expect(grid).not.toContain('MobileProductFilterDrawer');
    expect(grid).not.toContain('showFilters');
  });

  it('collection routes use ProductCatalogBand without mobile drawer', () => {
    const allRoute = readFile('app/routes/collections.all.tsx');
    const handleRoute = readFile('app/routes/collections.$handle.tsx');
    for (const route of [allRoute, handleRoute]) {
      expect(route).toContain('ProductCatalogBand');
      expect(route).toContain('useProductCatalogFilters');
      expect(route).not.toContain('MobileProductFilterDrawer');
      expect(route).not.toContain('FILTER_BAR_SHELL');
    }
  });

  it('ProductCatalogBand uses homepage sub-row with Alle chip', () => {
    const band = readFile('app/components/zehn/ProductCatalogBand.tsx');
    expect(band).toContain('subPresentation="subRow"');
    expect(band).toContain('showSubAlleChip');
    expect(band).toContain('showSubBottomSeparator');
    expect(band).toContain('showMainAlleChip');
    expect(band).toContain('onMainAlleSelect={handleMainAlleSelect}');
    expect(band).toContain('getCollectionBandCopy');
    expect(band).toContain('ProductFilterToolbar');
  });

  it('collection routes enable main-row Alle chip; homepage does not', () => {
    const allRoute = readFile('app/routes/collections.all.tsx');
    const handleRoute = readFile('app/routes/collections.$handle.tsx');
    const grid = readFile('app/components/zehn/ProductGrid.tsx');
    const nav = readFile('app/components/zehn/CategoryNavSection.tsx');

    expect(allRoute).toContain('showMainAlleChip');
    expect(handleRoute).toContain('showMainAlleChip={catalogBand}');
    expect(handleRoute).toContain('showMainRow={catalogBand}');
    expect(handleRoute).toContain('isCatalogBandPath');
    expect(handleRoute).toContain('filterChipNav');
    expect(grid).not.toContain('showMainAlleChip');
    expect(nav).toContain('showMainAlleChip');
    expect(nav).toContain('onMainAlleSelect');
    expect(nav).toContain('MAIN_ROW_ALLE_LABEL');
  });

  it('header catalog nav links pass fresh filter reset state', () => {
    const header = readFile('app/components/zehn/Header.tsx');
    expect(header).toContain('resolveCatalogNavTo(shopAllMenuUrl)');
    expect(header).toContain('resolveCatalogNavTo(url)');
    expect(header).toContain('MobileCollectionMenuSection');
  });

  it('useProductCatalogFilters supports catalog route sync', () => {
    const hook = readFile('app/hooks/useProductCatalogFilters.ts');
    expect(hook).toContain('routeSync');
    expect(hook).toContain('isCatalogRootPath');
    expect(hook).toContain('onCatalogFreshConsumed');
  });

  it('toolbar composes collapsible mobile panel, desktop row, chips, and sort meta', () => {
    const toolbar = readFile('app/components/zehn/ProductFilterToolbar.tsx');
    expect(toolbar).toContain('HomepageMobileFilterPanel');
    expect(toolbar).toContain('useProductFilterStackOpen');
    expect(toolbar).toContain('HOMEPAGE_FILTER_SEPARATOR');
    expect(toolbar).toContain('DesktopProductFilterRow');
    expect(toolbar).toContain('ProductFilterActiveChips');
    expect(toolbar).toContain('ProductSortMetaRow');
    expect(toolbar).toContain('PRODUCT_FILTER_TOOLBAR_DESKTOP');
    expect(toolbar).toContain('PRODUCT_FILTER_TOOLBAR_DESKTOP_ROW_PRIMARY');
    expect(toolbar).toContain('FILTER_TOOLBAR_BAND_A_MOBILE');
    expect(toolbar).not.toContain('PRODUCT_FILTER_TOOLBAR_DESKTOP_LEFT');
    expect(toolbar).not.toContain('ZEHN_HOMEPAGE_INSET_PY');
    expect(toolbar).not.toContain('Anwenden');
    expect(toolbar).toContain('showClearButton={false}');
    expect(toolbar).toMatch(/onClear,/);
    expect(toolbar).toContain('PRODUCT_FILTER_TOOLBAR_SHELL');
  });

  it('mobile filter panel uses stack gap without inline mt', () => {
    const panel = readFile('app/components/zehn/HomepageMobileFilterPanel.tsx');
    expect(panel).toContain('ZEHN_HOMEPAGE_STACK_GAP');
    expect(panel).not.toContain("'mt-3'");
  });

  it('mobile filter panel exposes collapsible aria-expanded via HeaderNavIconButton', () => {
    const panel = readFile('app/components/zehn/HomepageMobileFilterPanel.tsx');
    expect(panel).toContain('HeaderNavIconButton');
    expect(panel).toContain('ariaExpanded={open}');
    expect(panel).toContain('Filter einblenden');
    expect(panel).toContain('Filter ausblenden');
  });

  it('mobile band shell has no bottom border — separator moved', () => {
    const ui = readFile('app/lib/product-filter-ui.ts');
    const match = ui.match(
      /export const FILTER_TOOLBAR_BAND_A_MOBILE\s*=\s*\n\s*`([^`]+)`/,
    );
    expect(match?.[1]).toContain('lg:hidden');
    expect(match?.[1]).toContain('ZEHN_HOMEPAGE_STACK_GAP');
    expect(match?.[1]).not.toContain('border-b');
  });

  it('CustomSelect uses Radix Popover without hover zoom', () => {
    const select = readFile('app/components/CustomSelect.tsx');
    expect(select).toContain('dropdownWidth');
    expect(select).toContain('menuAlign');
    expect(select).toContain('SELECT_TRIGGER_BASE');
    expect(select).toContain('hover:bg-card/90');
    expect(select).not.toContain('hover:scale');
    expect(select).toContain('whitespace-normal');
    expect(select).toContain('text-center');
  });

  it('ProductSortMetaRow uses filter layout sort with content-width dropdown', () => {
    const meta = readFile('app/components/zehn/ProductSortMetaRow.tsx');
    expect(meta).toContain('PRODUCT_SORT_ICONS');
    expect(meta).toContain('PRODUCT_COUNT_ICON');
    expect(meta).toContain('layout="filter"');
    expect(meta).toContain('PRODUCT_SORT_DROPDOWN_WIDTH');
    expect(meta).toContain('menuAlign="start"');
    expect(meta).toContain('PRODUCT_SORT_PLACEHOLDER');
  });

  it('product-filter-ui has no deprecated toolbar padding aliases', () => {
    const ui = readFile('app/lib/product-filter-ui.ts');
    expect(ui).not.toContain('HOMEPAGE_FILTER_TOOLBAR_TOP');
    expect(ui).not.toContain('HOMEPAGE_FILTER_TOOLBAR_BOTTOM');
    expect(ui).not.toContain('FILTER_TOOLBAR_BAND_A =');
    expect(ui).toContain('PRODUCT_SORT_DROPDOWN_WIDTH');
  });

  it('sort meta row tokens stack mobile, center count, no extra py', () => {
    const ui = readFile('app/lib/product-filter-ui.ts');
    expect(ui).toMatch(/PRODUCT_SORT_META_ROW[\s\S]*flex-col/);
    expect(ui).toMatch(/PRODUCT_SORT_META_ROW[\s\S]*lg:flex-row/);
    expect(ui).not.toMatch(/PRODUCT_SORT_META_ROW[\s\S]*pt-2/);
    expect(ui).toMatch(/PRODUCT_SORT_COUNT_ROW[\s\S]*justify-center/);
    expect(ui).toMatch(/PRODUCT_SORT_COUNT_ROW[\s\S]*lg:justify-start/);
    expect(ui).toContain('PRODUCT_SORT_SELECT');
    expect(ui).toContain('ZEHN_FILTER_PILL_MIN_W');
    expect(ui).not.toMatch(/PRODUCT_SORT_SELECT[\s\S]*ml-auto/);
  });

  it('ProductGrid uses shared grid top rhythm token', () => {
    const grid = readFile('app/components/zehn/ProductGrid.tsx');
    expect(grid).toContain('ZEHN_HOMEPAGE_GRID_TOP');
    expect(grid).not.toContain('pb-0 lg:pb-0');
  });

  it('category nav stack gap aligns with homepage stack rhythm', () => {
    const nav = readFile('app/lib/category-nav-styles.ts');
    expect(nav).toContain('ZEHN_HOMEPAGE_STACK_GAP');
  });

  it('DesktopProductFilterRow supports optional showClearButton', () => {
    const row = readFile('app/components/zehn/DesktopProductFilterRow.tsx');
    expect(row).toContain('showClearButton');
    expect(row).toMatch(/showClearButton = true/);
    expect(row).toMatch(/showClear && showClearButton/);
  });

  it('ProductFilterActiveChips uses ripple, lead copy, and compact clear (BL-0013)', () => {
    const chips = readFile('app/components/zehn/ProductFilterActiveChips.tsx');
    expect(chips).toContain('clearAllMinCount');
    expect(chips).toContain('PRODUCT_FILTER_CLEAR_ALL_MIN');
    expect(chips).toContain('RippleButton');
    expect(chips).toContain('PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_TEXT_LONG');
    expect(chips).toContain('PRODUCT_FILTER_ACTIVE_CHIP_REMOVE_ICON');
    expect(chips).toContain('size="compact"');
    expect(chips).toContain('hidden lg:inline-flex');
    expect(chips).toContain('FilterClearButton');
  });

  it('desktop toolbar uses two-row layout tokens (BL-0013)', () => {
    const ui = readFile('app/lib/product-filter-ui.ts');
    expect(ui).toContain('PRODUCT_FILTER_TOOLBAR_DESKTOP_ROW_PRIMARY');
    const desktopMatch = ui.match(
      /export const HOMEPAGE_FILTER_TOOLBAR_DESKTOP\s*=\s*\n\s*`([^`]+)`/,
    );
    expect(desktopMatch?.[1]).toContain('lg:flex-col');
    expect(desktopMatch?.[1]).not.toContain('lg:items-center');
  });

  it('facet triggers use content-fit shell token (BL-0014)', () => {
    const ui = readFile('app/lib/product-filter-ui.ts');
    const row = readFile('app/components/zehn/DesktopProductFilterRow.tsx');
    const select = readFile('app/components/CustomSelect.tsx');
    expect(ui).toContain('PRODUCT_FILTER_TRIGGER_SHELL');
    expect(ui).toContain('ZEHN_FILTER_PILL_MIN_W');
    expect(ui).toContain('w-auto');
    expect(ui).not.toContain('PRODUCT_FILTER_MIN_WIDTH');
    expect(row).toContain('PRODUCT_FILTER_TRIGGER_SHELL');
    expect(row).not.toContain('PRODUCT_FILTER_MIN_WIDTH');
    expect(select).toContain('whitespace-nowrap');
    expect(select).not.toContain('leading-tight truncate');
    expect(ui).toMatch(/FILTER_SELECT_TRIGGER[\s\S]*auto/);
  });

  it('active chips row uses ListFilter lead icon (BL-0014)', () => {
    const chips = readFile('app/components/zehn/ProductFilterActiveChips.tsx');
    const ui = readFile('app/lib/product-filter-ui.ts');
    expect(chips).toContain('ListFilter');
    expect(chips).toContain('PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_ICON');
    expect(chips).toContain('PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_TEXT');
    expect(ui).toContain('PRODUCT_FILTER_ACTIVE_CHIPS_ICON');
    expect(ui).not.toMatch(
      /PRODUCT_FILTER_ACTIVE_CHIPS_LEAD[\s\S]*hidden lg:inline font-sans/,
    );
  });

  it('FilterClearButton supports compact chip-row size (BL-0013)', () => {
    const clear = readFile('app/components/zehn/FilterClearButton.tsx');
    expect(clear).toContain("size?: 'default' | 'compact'");
    expect(clear).toContain('PRODUCT_FILTER_CLEAR_CHIP');
  });

  it('ProductCatalogBand uses catalog shell without section py on collection routes', () => {
    const band = readFile('app/components/zehn/ProductCatalogBand.tsx');
    const styles = readFile('app/lib/category-nav-styles.ts');
    expect(styles).toContain('CATEGORY_NAV_CATALOG_SHELL');
    expect(styles).toContain('CATEGORY_NAV_BAND_SHELL_BASE');
    expect(styles).toMatch(
      /CATEGORY_NAV_CATALOG_SHELL[\s\S]*CATEGORY_NAV_BAND_SHELL_BASE/,
    );
    expect(styles).toMatch(
      /CATEGORY_NAV_HOMEPAGE_SHELL[\s\S]*CATEGORY_NAV_BAND_SHELL_BASE/,
    );
    expect(styles).not.toMatch(
      /CATEGORY_NAV_HOMEPAGE_SHELL[\s\S]*ZEHN_HOMEPAGE_SECTION_PY/,
    );
    expect(styles).not.toMatch(
      /CATEGORY_NAV_CATALOG_SHELL[\s\S]*ZEHN_HOMEPAGE_SECTION_PY/,
    );
    expect(band).toContain('CATEGORY_NAV_CATALOG_SHELL');
    expect(band).toContain('CATEGORY_NAV_HOMEPAGE_SHELL');
    expect(band).toContain('CATEGORY_NAV_HOMEPAGE_IDLE_PY');
    expect(band).toContain('isHomepageIdle');
    expect(band).toContain("navVariant === 'homepage'");
  });

  it('route sync uses isBandLeaf for catalog root reset (BL-0017)', () => {
    const hook = readFile('app/hooks/useProductCatalogFilters.ts');
    expect(hook).toContain('const isBandLeaf = isBand && !isRoot');
    expect(hook).toContain('if (isBandLeaf)');
  });

  it('ProductCatalogBand publishes chip nav + main Alle divider (BL-0017)', () => {
    const band = readFile('app/components/zehn/ProductCatalogBand.tsx');
    expect(band).toContain('usePublishCatalogChipNav');
    expect(band).toContain('CATEGORY_NAV_MAIN_BOTTOM_DIVIDER');
    expect(band).toContain('showMainBottomDivider');
  });

  it('Header syncs mobile menu with chip snapshot (BL-0017)', () => {
    const header = readFile('app/components/zehn/Header.tsx');
    const panel = readFile('app/components/zehn/CategoryMenuPanel.tsx');
    const layout = readFile('app/components/PageLayout.tsx');
    expect(header).toContain('useCatalogChipNav');
    expect(header).toContain('isMobileCatalogAccordionLabelActive');
    expect(header).toContain('mobileAccordionHintRef');
    expect(panel).toContain('resolveChipMenuOpenSection');
    expect(panel).toContain('setOpenSection(resolvedOpenSection)');
    expect(layout).toContain('CatalogChipNavProvider');
    expect(header).toContain('isCatalogFreshNavUrl');
  });

  it('category-nav-section uses zero mb — band stack gap owns sibling rhythm (BL-0016)', () => {
    const css = readFile('app/styles/app.css');
    const block = css.match(/\.category-nav-section\s*\{[^}]+\}/)?.[0];
    expect(block).toBeDefined();
    expect(block).toContain('margin-bottom: 0');
    expect(block).not.toContain('margin-bottom: 1.5rem');
  });

  it('barrel exports ART-0040 filter and nav components', () => {
    const barrel = readFile('app/components/zehn/index.ts');
    expect(barrel).toContain('ProductCatalogBand');
    expect(barrel).toContain('ProductFilterToolbar');
    expect(barrel).toContain('HomepageMobileFilterPanel');
    expect(barrel).not.toContain('MobileProductFilterStack');
    expect(barrel).toContain('ProductFilterActiveChips');
    expect(barrel).toContain('ProductSortMetaRow');
    expect(barrel).toContain('CategoryNavSubRow');
    expect(barrel).toContain('CategoryNavSubPresentation');
  });
});
