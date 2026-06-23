import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

const glowCssPath = resolve(
  process.cwd(),
  'app/styles/category-nav-glow.css',
);
const heroCssPath = resolve(
  process.cwd(),
  'app/styles/homepage-hero.css',
);
const stylesTsPath = resolve(
  process.cwd(),
  'app/lib/category-nav-styles.ts',
);

describe('category-nav-glow', () => {
  it('glow CSS defines chip + hero-parity title spotlight tokens', () => {
    const css = readFileSync(glowCssPath, 'utf8');
    expect(css).toContain('--category-nav-chip-glow:');
    expect(css).toContain('--category-nav-chip-glow-active:');
    expect(css).toContain('--category-nav-title-spotlight:');
    expect(css).toContain('0.38');
    expect(css).toContain('--category-nav-subtitle-spotlight:');
  });

  it('category-nav-styles.ts exports header spotlight + homepage shell', () => {
    const ts = readFileSync(stylesTsPath, 'utf8');
    expect(ts).not.toContain('CATEGORY_NAV_CHIP_GLOW');
    expect(ts).not.toContain('CATEGORY_NAV_HEADER_GLOW');
    expect(ts).toContain('CATEGORY_NAV_HEADER_SPOTLIGHT');
    expect(ts).toContain('CATEGORY_NAV_HOMEPAGE_SHELL');
    expect(ts).toContain('category-nav-glow.css');
  });

  it('homepage hero fold does not cap height by category band', () => {
    const heroCss = readFileSync(heroCssPath, 'utf8');
    expect(heroCss).toContain('--homepage-category-band:');
    expect(heroCss).not.toContain('[data-homepage-first-screen]');
    expect(heroCss).not.toContain(
      '100dvh - var(--site-header-stack-desktop) - var(--homepage-category-band)',
    );
  });
});
