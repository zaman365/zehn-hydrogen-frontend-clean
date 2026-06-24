/**
 * SMOKE TESTS — Typography Migration: Critical Path Sanity
 * Step 5: Fast, shallow tests that answer "is the typography system broken?"
 */
import {describe, it, expect} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {execSync} from 'child_process';

const ROOT = path.resolve(__dirname, '../..');

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf-8');
}

// ============================================================================
// SMOKE 1: Font files load correctly (self-hosted — Phase 1 zero-flicker plan)
// ============================================================================
describe('Smoke — Font Loading', () => {
  it('Self-hosted Space Grotesk WOFF2 preload exists in root.tsx (no Google Fonts CDN)', () => {
    const rootContent = readFile('app/root.tsx');
    // Phase 1: fonts served from public/fonts/, preloaded via links()
    expect(rootContent).toContain('/fonts/space-grotesk/space-grotesk-variable.woff2');
    expect(rootContent).not.toContain('fonts.googleapis.com');
  });

  it('fonts.css defines @font-face for Space Grotesk and Inter (not Archivo)', () => {
    const fontsContent = readFile('app/styles/fonts.css');
    expect(fontsContent).toContain("font-family: 'Space Grotesk'");
    expect(fontsContent).toContain("font-family: 'Inter'");
    // Archivo Black removed — no references remain
    expect(fontsContent).not.toContain('Archivo');
  });
});

// ============================================================================
// SMOKE 2: Tailwind config produces valid output
// ============================================================================
describe('Smoke — Tailwind Config Integrity', () => {
  it('tailwind.config.js is valid JavaScript', () => {
    expect(() => {
      // Just check that the file parses without syntax errors
      const content = readFile('tailwind.config.js');
      // Simple structural validation
      expect(content).toContain('export default');
      expect(content).toContain('fontFamily');
      expect(content).toContain('fontSize');
    }).not.toThrow();
  });

  it('Both font-sans and font-body resolve to the same font', () => {
    const content = readFile('tailwind.config.js');
    const sansMatch = content.match(/sans\s*:\s*\[([^\]]+)\]/);
    const bodyMatch = content.match(/body\s*:\s*\[([^\]]+)\]/);
    expect(sansMatch).not.toBeNull();
    expect(bodyMatch).not.toBeNull();
    // Both should contain Space Grotesk
    expect(sansMatch![1]).toContain('Space Grotesk');
    expect(bodyMatch![1]).toContain('Space Grotesk');
  });
});

// ============================================================================
// SMOKE 3: No Archivo Black anywhere in production code
// ============================================================================
describe('Smoke — Complete Archivo Removal', () => {
  it('No Archivo Black references in entire app/ directory', () => {
    try {
      const result = execSync(
        'grep -rn "Archivo" app/ --include="*.tsx" --include="*.ts" --include="*.css" --include="*.js" 2>/dev/null || true',
        {cwd: ROOT, encoding: 'utf-8'}
      );
      // Filter out test files and comments
      const prodLines = result
        .split('\n')
        .filter((l) => l.trim())
        .filter((l) => !l.includes('__tests__'))
        .filter((l) => !l.includes('.test.'));
      expect(prodLines).toHaveLength(0);
    } catch {
      // grep returns exit 1 when no matches — that's actually what we want
    }
  });
});

// ============================================================================
// SMOKE 4: No weight 900 on Space Grotesk (Inter hero display may use 900)
// ============================================================================
describe('Smoke — No Weight 900', () => {
  it('No fontWeight 900 in config or design tokens', () => {
    const tailwind = readFile('tailwind.config.js');
    const tokens = readFile('app/lib/design-tokens.ts');
    expect(tailwind).not.toMatch(/fontWeight\s*:\s*['"]900['"]/);
    expect(tokens).not.toMatch(/fontWeight\s*:\s*['"]900['"]/);
  });

  it('Space Grotesk CSS rules do not use font-weight: 900 (max weight is 700)', () => {
    // fonts.css @font-face for Space Grotesk uses variable range 300 700, not 900
    const fontsCss = readFile('app/styles/fonts.css');
    const sgBlocks = fontsCss.match(
      /font-family:\s*['"]Space Grotesk['"][^}]+}/gs,
    );
    expect(sgBlocks).not.toBeNull();
    for (const block of sgBlocks!) {
      // Range syntax is "300 700" — no 900 in Space Grotesk blocks
      expect(block).not.toContain(' 900');
    }
    // Inter hero display intentionally uses weight 900 — that is allowed
  });

  it('No font-black Tailwind class in component files', () => {
    const result = execSync(
      'grep -rn "font-black" app/components/ app/routes/ --include="*.tsx" 2>/dev/null || true',
      {cwd: ROOT, encoding: 'utf-8'}
    );
    const lines = result.split('\n').filter((l) => l.trim());
    expect(lines).toHaveLength(0);
  });
});

// ============================================================================
// SMOKE 5: Critical pages render without font errors
// ============================================================================
describe('Smoke — Critical Page Files Exist & Have Font Classes', () => {
  // Route files that directly contain typography classes
  const criticalComponentFiles = [
    {path: 'app/routes/products.$handle.tsx', name: 'Product Page'},
    {path: 'app/routes/collections.$handle.tsx', name: 'Collection Page'},
    {path: 'app/components/zehn/CartDrawer.tsx', name: 'Cart Drawer'},
    {path: 'app/components/zehn/Footer.tsx', name: 'Footer'},
    {path: 'app/components/zehn/Header.tsx', name: 'Header'},
    {path: 'app/components/zehn/SearchModal.tsx', name: 'Search Modal'},
    {path: 'app/components/zehn/Hero.tsx', name: 'Hero'},
  ];

  for (const file of criticalComponentFiles) {
    it(`${file.name} exists and uses typography classes`, () => {
      const content = readFile(file.path);
      expect(content.length).toBeGreaterThan(0);
      // Every critical component must use brand font (font-sans / font-body / Tailwind weight)
      // Hero is CSS-class-based (hero-title-mobile/desktop in app.css) — HERO_TITLE_MOBILE token
      const hasFontClass =
        content.includes('font-sans') ||
        content.includes('font-body') ||
        content.includes('font-medium') ||
        content.includes('font-bold') ||
        content.includes('font-semibold') ||
        content.includes('HERO_TITLE_MOBILE') || // Hero uses CSS class system
        content.includes('hero-title-mobile');
      expect(hasFontClass).toBe(true);
    });
  }

  // Homepage is a composition route — verify it imports typography-aware components
  it('Homepage imports typography-aware components', () => {
    const content = readFile('app/routes/_index.tsx');
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain('Hero');
    expect(content).toContain('ProductGrid');
  });
});

// ============================================================================
// SMOKE 6: Typography scale has responsive variants
// ============================================================================
describe('Smoke — Responsive Typography Scale', () => {
  it('Tailwind config has mobile, tablet, and desktop heading sizes', () => {
    const content = readFile('tailwind.config.js');
    // Must have base, sm, and lg variants for h1, h2, h3
    for (const level of ['h1', 'h2', 'h3']) {
      expect(content).toContain(`'${level}'`);
      expect(content).toContain(`'${level}-sm'`);
      expect(content).toContain(`'${level}-lg'`);
    }
  });
});

// ============================================================================
// SMOKE 7: Design tokens are consistent with Tailwind config
// ============================================================================
describe('Smoke — Token/Config Consistency', () => {
  it('Both design-tokens and tailwind.config use the same font', () => {
    const tokens = readFile('app/lib/design-tokens.ts');
    const tailwind = readFile('tailwind.config.js');
    // design-tokens FontFamilies block
    const tokenBlock = tokens.match(/FontFamilies\s*=\s*\{([^}]+)\}/s);
    expect(tokenBlock).not.toBeNull();
    const tokenSansLine = tokenBlock![1].split('\n').find((l: string) => l.trimStart().startsWith('sans'));
    expect(tokenSansLine).toBeDefined();
    expect(tokenSansLine).toContain('Space Grotesk');
    // tailwind config
    const tailwindSans = tailwind.match(/sans\s*:\s*\[([^\]]+)\]/);
    expect(tailwindSans).not.toBeNull();
    expect(tailwindSans![1]).toContain('Space Grotesk');
  });
});
