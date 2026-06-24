import {describe, expect, it} from 'vitest';
import {
  getCategorySectionCopy,
  getCategorySubRowHint,
  getCollectionBandCopy,
  MAIN_ROW_ALLE_LABEL,
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

  it('exports main-row and sub-row Alle labels', () => {
    expect(SUB_ROW_ALLE_LABEL).toBe('ALLE');
    expect(MAIN_ROW_ALLE_LABEL).toBe('ALLE');
    expect(getCategorySubRowHint('hosen').desktop).toContain('Cargo');
  });

  it('sub-row desktop hint differs from header marketing subtitle', () => {
    const header = getCategorySectionCopy('category', 'shorts');
    const hint = getCategorySubRowHint('shorts');
    expect(hint.desktop).not.toBe(header.subtitle);
    expect(hint.desktop).toBe('Cargo, Chino & mehr');
  });

  it('getCollectionBandCopy — page branding when no main chip', () => {
    const copy = getCollectionBandCopy('shop-all', '', '');
    expect(copy.title).toBe('ALLE PRODUKTE');
    expect(copy.subtitle).toBe('Die komplette ZEHN Kollektion');
  });

  it('getCollectionBandCopy — category marketing when main chip active', () => {
    const copy = getCollectionBandCopy('neuheiten', 'shorts', 'shorts');
    expect(copy.title).toBe('SHORTS');
    expect(copy.subtitle).toContain('Sommertag');
  });

  it('getCollectionBandCopy — sub chip keeps parent main marketing', () => {
    const copy = getCollectionBandCopy(
      'bestseller',
      'shorts',
      'cargo-shorts',
    );
    expect(copy.title).toBe('CARGO-SHORTS');
    expect(copy.subtitle).toContain('Sommertag');
  });
});
