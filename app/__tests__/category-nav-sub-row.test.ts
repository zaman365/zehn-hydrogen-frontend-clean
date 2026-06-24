import {describe, expect, it} from 'vitest';
import {getCategorySubRowHint} from '~/lib/category-section-copy';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

describe('category-nav sub row', () => {
  it('defines content-width divider styles', () => {
    const css = readFile('app/styles/category-nav-sub-row.css');
    expect(css).toContain('.category-nav-sub-row__divider');
    expect(css).toContain('width: fit-content');
    expect(css).not.toContain('category-nav-sub-tabs');
  });

  it('homepage ProductCatalogBand uses subRow presentation', () => {
    const band = readFile('app/components/zehn/ProductCatalogBand.tsx');
    const grid = readFile('app/components/zehn/ProductGrid.tsx');
    expect(band).toContain('subPresentation="subRow"');
    expect(band).toContain('subChipVariant="main"');
    expect(band).toContain('getCategorySubRowHint');
    expect(grid).toContain('navVariant="homepage"');
    expect(grid).toContain('ProductCatalogBand');
  });

  it('CategoryNavSubRow supports Alle chip and bottom separator', () => {
    const subRow = readFile('app/components/zehn/CategoryNavSubRow.tsx');
    const band = readFile('app/components/zehn/ProductCatalogBand.tsx');
    const subStyles = readFile('app/lib/category-nav-sub-styles.ts');
    expect(subRow).toContain('showAlleChip');
    expect(subRow).toContain('showBottomSeparator');
    expect(subRow).toContain('SUB_ROW_ALLE_LABEL');
    expect(subRow).toContain('CATEGORY_NAV_SUB_BOTTOM_DIVIDER');
    expect(subStyles).toContain('CATEGORY_NAV_MAIN_BOTTOM_DIVIDER');
    expect(band).toContain('showMainBottomDivider');
  });

  it('CategoryNavSection supports chips and subRow modes', () => {
    const section = readFile('app/components/zehn/CategoryNavSection.tsx');
    expect(section).toContain("subPresentation?: CategoryNavSubPresentation");
    expect(section).toContain('CategoryNavSubRow');
    expect(section).toContain('CATEGORY_NAV_SECTION_HOME');
    expect(section).toContain('CATEGORY_NAV_STACK_GAP');
    expect(section).toContain('showSubAlleChip');
    expect(section).not.toContain('CategoryNavSubTabs');
  });

  it('getCategorySubRowHint returns mobile and desktop strings', () => {
    const hint = getCategorySubRowHint('shorts');
    expect(hint.mobile).toBe('Variante wählen');
    expect(hint.desktop).toContain('Cargo');
  });
});
