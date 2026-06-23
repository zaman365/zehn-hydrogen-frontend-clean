import {describe, expect, it} from 'vitest';
import {
  getActiveProductFilterChips,
  HOMEPAGE_FILTER_SEPARATOR,
  isProductFilterActive,
  PRODUCT_FILTER_CLEAR_ALL_MIN,
  PRODUCT_SORT_ICONS,
  PRODUCT_SORT_OPTIONS,
} from '~/lib/product-filter-ui';
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
    expect(PRODUCT_FILTER_CLEAR_ALL_MIN).toBe(2);
  });
});

describe('product filter toolbar wiring', () => {
  it('ProductGrid uses ProductFilterToolbar without mobile drawer', () => {
    const grid = readFile('app/components/zehn/ProductGrid.tsx');
    expect(grid).toContain('ProductFilterToolbar');
    expect(grid).not.toContain('MobileProductFilterDrawer');
    expect(grid).not.toContain('showFilters');
    expect(grid).not.toContain('viewAllHref');
    expect(grid).not.toContain('getCollectionPath');
    expect(grid).not.toContain('getCategoryUrl');
  });

  it('toolbar composes collapsible mobile panel, desktop row, chips, and sort meta', () => {
    const toolbar = readFile('app/components/zehn/ProductFilterToolbar.tsx');
    expect(toolbar).toContain('HomepageMobileFilterPanel');
    expect(toolbar).toContain('useHomepageFilterStackOpen');
    expect(toolbar).toContain('HOMEPAGE_FILTER_SEPARATOR');
    expect(toolbar).toContain('DesktopProductFilterRow');
    expect(toolbar).toContain('ProductFilterActiveChips');
    expect(toolbar).toContain('ProductSortMetaRow');
    expect(toolbar).toContain('HOMEPAGE_FILTER_TOOLBAR_DESKTOP');
    expect(toolbar).toContain('FILTER_TOOLBAR_BAND_A_MOBILE');
    expect(toolbar).not.toContain('Anwenden');
    expect(toolbar).toContain('showClearButton={false}');
    expect(toolbar).toMatch(/onClear,/);
    expect(toolbar).toContain('HOMEPAGE_FILTER_TOOLBAR_SHELL');
    expect(toolbar).toContain('ZEHN_HOMEPAGE_INSET_PY');
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
    const sortMatch = ui.match(/export const PRODUCT_SORT_SELECT\s*=\s*'([^']+)'/);
    expect(sortMatch?.[1]).toContain('w-full');
    expect(sortMatch?.[1]).not.toContain('ml-auto');
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

  it('ProductFilterActiveChips documents clearAllMinCount for desktop clear-all', () => {
    const chips = readFile('app/components/zehn/ProductFilterActiveChips.tsx');
    expect(chips).toContain('clearAllMinCount');
    expect(chips).toContain('PRODUCT_FILTER_CLEAR_ALL_MIN');
    expect(chips).toContain('hidden lg:inline-flex');
    expect(chips).toContain('FilterClearButton');
  });

  it('barrel exports ART-0040 filter and nav components', () => {
    const barrel = readFile('app/components/zehn/index.ts');
    expect(barrel).toContain('ProductFilterToolbar');
    expect(barrel).toContain('HomepageMobileFilterPanel');
    expect(barrel).not.toContain('MobileProductFilterStack');
    expect(barrel).toContain('ProductFilterActiveChips');
    expect(barrel).toContain('ProductSortMetaRow');
    expect(barrel).toContain('CategoryNavSubRow');
    expect(barrel).toContain('CategoryNavSubPresentation');
  });
});
