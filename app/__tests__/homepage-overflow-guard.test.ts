import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

describe('homepage overflow guard', () => {
  it('clips horizontal overflow on html, body, and main', () => {
    const appCss = readFile('app/styles/app.css');
    expect(appCss).toMatch(/html\s*\{[^}]*overflow-x:\s*clip/s);
    expect(appCss).toMatch(/body\s*\{[^}]*overflow-x:\s*clip/s);

    const layout = readFile('app/components/PageLayout.tsx');
    expect(layout).toContain('overflow-x-clip');
    expect(layout).toContain('max-w-full');
  });

  it('contains glow sections with overflow-x clip', () => {
    const appCss = readFile('app/styles/app.css');
    expect(appCss).toContain('.trust-strip-section');
    expect(appCss).toMatch(/\.trust-strip-section\s*\{[^}]*overflow-x:\s*clip/s);
    expect(appCss).toMatch(/\.homepage-category-nav-shell\s*\{[^}]*overflow-x:\s*clip/s);
  });

  it('homepage ProductGrid section constrains horizontal scroll', () => {
    const grid = readFile('app/components/zehn/ProductGrid.tsx');
    expect(grid).toContain('overflow-x-clip');
    expect(grid).toContain('min-w-0');
    expect(grid).not.toContain('MobileProductFilterDrawer');
  });
});
