import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

const glowCssPath = resolve(
  process.cwd(),
  'app/styles/category-nav-glow.css',
);
const appCssPath = resolve(process.cwd(), 'app/styles/app.css');
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

  it('glow CSS defines active glass gradient + inset bloom tokens', () => {
    const css = readFileSync(glowCssPath, 'utf8');
    expect(css).toContain('--category-nav-chip-active-bg-main:');
    expect(css).toContain('--category-nav-chip-active-bg-sub:');
    expect(css).toContain('--category-nav-chip-active-inset:');
    expect(css).toContain('--category-nav-chip-active-border:');
    expect(css).toContain('linear-gradient');
    expect(css).toContain('0.22');
  });

  it('app.css active chips use glass tokens — not solid primary fill', () => {
    const css = readFileSync(appCssPath, 'utf8');
    const activeMainBlock = css.match(
      /\.category-nav-chip--active\.category-nav-chip--main\s*\{[^}]+\}/,
    )?.[0];
    const activeSubBlock = css.match(
      /\.category-nav-chip--active\.category-nav-chip--sub\s*\{[^}]+\}/,
    )?.[0];
    expect(activeMainBlock).toBeDefined();
    expect(activeSubBlock).toBeDefined();
    expect(activeMainBlock).toContain('--category-nav-chip-active-bg-main');
    expect(activeSubBlock).toContain('--category-nav-chip-active-bg-sub');
    expect(activeMainBlock).toContain('--category-nav-chip-active-inset');
    expect(activeMainBlock).not.toMatch(
      /background:\s*var\(--primary/,
    );
    expect(activeSubBlock).not.toMatch(/background:\s*var\(--primary/);
  });

  it('app.css sub chip row gap matches main row (BL-0013)', () => {
    const css = readFileSync(appCssPath, 'utf8');
    const subBlock = css.match(/\.category-nav-chips--sub\s*\{[^}]+\}/)?.[0];
    expect(subBlock).toBeDefined();
    expect(subBlock).toContain('gap: 0.5rem');
    expect(subBlock).not.toContain('gap: 0.375rem');
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
