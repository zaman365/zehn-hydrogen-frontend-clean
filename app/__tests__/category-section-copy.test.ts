import {describe, expect, it} from 'vitest';
import {
  getCategorySectionCopy,
  getCategorySubRowHint,
  SUB_ROW_ALLE_LABEL,
} from '~/lib/category-section-copy';

describe('category-section-copy', () => {
  it('homepage — warm ZEHN branding distinct from hero', () => {
    const copy = getCategorySectionCopy('homepage');
    expect(copy.title).toBe('Finde, was du brauchst');
    expect(copy.subtitle).toBe(
      'Wähle eine Kategorie und entdecke deine Essentials',
    );
  });

  it('bestseller — static copy unchanged', () => {
    const copy = getCategorySectionCopy('bestseller');
    expect(copy.title).toBe('BESTSELLER');
    expect(copy.subtitle).toBe('Beliebte Styles — von Kunden gefeiert');
  });

  it('category — dynamic label from slug', () => {
    const copy = getCategorySectionCopy('category', 'shorts');
    expect(copy.title).toBe('SHORTS');
    expect(copy.subtitle).toContain('Sommertag');
  });

  it('exports sub-row Alle label and hint helper', () => {
    expect(SUB_ROW_ALLE_LABEL).toBe('ALLE');
    expect(getCategorySubRowHint('hosen').desktop).toContain('Cargo');
  });
});
