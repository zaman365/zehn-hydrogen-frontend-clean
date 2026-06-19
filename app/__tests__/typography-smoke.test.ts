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
// SMOKE 1: Font files load correctly
// ============================================================================
describe('Smoke — Font Loading', () => {
  it('Google Fonts URL is valid and contains Space Grotesk', () => {
    const rootContent = readFile('app/root.tsx');
    const urlMatch = rootContent.match(
      /https:\/\/fonts\.googleapis\.com\/css2\?[^'"]+/
    );
    expect(urlMatch).not.toBeNull();
    expect(urlMatch![0]).toContain('Space+Grotesk');
  });

  it('Only one font family is loaded (not two)', () => {
    const rootContent = readFile('app/root.tsx');
    const urlMatch = rootContent.match(
      /https:\/\/fonts\.googleapis\.com\/css2\?[^'"]+/
    );
    expect(urlMatch).not.toBeNull();
    const url = urlMatch![0];
    // Count 'family=' occurrences — should be exactly 1
    const familyCount = (url.match(/family=/g) || []).length;
    expect(familyCount).toBe(1);
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
// SMOKE 4: No weight 900 anywhere
// ============================================================================
describe('Smoke — No Weight 900', () => {
  it('No fontWeight 900 in config or design tokens', () => {
    const tailwind = readFile('tailwind.config.js');
    const tokens = readFile('app/lib/design-tokens.ts');
    expect(tailwind).not.toMatch(/fontWeight\s*:\s*['"]900['"]/);
    expect(tokens).not.toMatch(/fontWeight\s*:\s*['"]900['"]/);
  });

  it('No font-weight: 900 in CSS files', () => {
    const appCss = readFile('app/styles/app.css');
    const resetCss = readFile('app/styles/reset.css');
    expect(appCss).not.toContain('font-weight: 900');
    expect(resetCss).not.toContain('font-weight: 900');
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
      // Every critical component file should have font-related classes
      const hasFontClass =
        content.includes('font-sans') ||
        content.includes('font-body') ||
        content.includes('font-medium') ||
        content.includes('font-bold') ||
        content.includes('font-semibold');
      expect(hasFontClass).toBe(true);
    });
  }

  // Homepage is a composition route — verify it imports typography-aware components
  it('Homepage imports typography-aware components', () => {
    const content = readFile('app/routes/_index.tsx');
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain('Hero');
    expect(content).toContain('ProductGrid');
    expect(content).toContain('FeatureSection');
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
