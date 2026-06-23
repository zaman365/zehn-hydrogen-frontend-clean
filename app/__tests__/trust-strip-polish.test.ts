import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

describe('trust-strip-glow.css', () => {
  it('defines per-item orange glow tokens and ::before splash without card box-shadow', () => {
    const css = readFile('app/styles/trust-strip-glow.css');
    expect(css).toContain('--trust-strip-item-glow');
    expect(css).toContain('--trust-strip-item-glow-strong');
    expect(css).toContain('.trust-strip-item__row::before');
    expect(css).not.toMatch(/\.trust-strip-item__row\s*\{[^}]*box-shadow/s);
  });
});

describe('trust-strip-styles', () => {
  it('uses mobile 2x2 grid and desktop spread layout', () => {
    const content = readFile('app/lib/trust-strip-styles.ts');
    expect(content).toContain('grid-cols-2');
    expect(content).toContain('justify-items-center');
    expect(content).toContain('lg:justify-between');
    expect(content).toContain('ZEHN_HOMEPAGE_SECTION_PY');
  });
});

describe('homepage section rhythm', () => {
  it('uses fixed ZEHN_HOMEPAGE_SECTION_PY on Finde and trust strip', () => {
    const category = readFile('app/lib/category-nav-styles.ts');
    const trust = readFile('app/lib/trust-strip-styles.ts');
    expect(category).toContain('ZEHN_HOMEPAGE_SECTION_PY');
    expect(trust).toContain('ZEHN_HOMEPAGE_SECTION_PY');
  });

  it('does not use dynamic homepage-section-band-py clamp', () => {
    const css = readFile('app/styles/app.css');
    expect(css).not.toContain('--homepage-section-band-py');
    expect(css).not.toMatch(
      /\.homepage-category-nav-shell\s*\{[^}]*padding-block/s,
    );
  });
});

describe('homepage trust strip structure', () => {
  it('places trust strip directly after hero without first-viewport wrapper', () => {
    const content = readFile('app/routes/_index.tsx');
    expect(content).not.toContain('data-homepage-first-viewport');
    expect(content).toContain('data-homepage-hero-fold');
    expect(content).toContain('<TrustBadges />');
  });
});

describe('ProductGrid homepage section', () => {
  it('has no py-0.5 gap above Finde band', () => {
    const content = readFile('app/components/zehn/ProductGrid.tsx');
    expect(content).not.toContain('py-0.5');
    expect(content).toContain('py-0');
    expect(content).toContain('ZEHN_SITE_CONTENT_ROW');
  });
});
