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

  it('homepage ProductGrid uses subRow presentation', () => {
    const grid = readFile('app/components/zehn/ProductGrid.tsx');
    expect(grid).toContain('subPresentation="subRow"');
    expect(grid).toContain('subChipVariant="main"');
    expect(grid).toContain('getCategorySubRowHint');
    expect(grid).toContain('variant="homepage"');
    expect(grid).toContain('showSubAlleChip');
    expect(grid).toContain('showSubBottomSeparator');
    expect(grid).toContain('CATEGORY_NAV_STACK_GAP');
    expect(grid).toMatch(/selectedCategory === category \? '' : category/);
  });

  it('CategoryNavSubRow supports Alle chip and bottom separator', () => {
    const subRow = readFile('app/components/zehn/CategoryNavSubRow.tsx');
    expect(subRow).toContain('showAlleChip');
    expect(subRow).toContain('showBottomSeparator');
    expect(subRow).toContain('SUB_ROW_ALLE_LABEL');
    expect(subRow).toContain('CATEGORY_NAV_SUB_BOTTOM_DIVIDER');
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
    expect(hint.desktop).toContain('Sommertag');
  });
});
