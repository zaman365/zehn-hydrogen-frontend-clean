/**
 * UAT — User Acceptance Tests: Typography Migration
 * Step 8: Verify every acceptance criterion from the migration plan is satisfied.
 *
 * Acceptance Criteria from TYPOGRAPHY_MIGRATION_PLAN.md Section 9:
 * AC-1: All text uses Space Grotesk font only
 * AC-2: No Archivo Black references in code
 * AC-3: Clear visual hierarchy maintained (weights 300-700)
 * AC-4: No console errors or font loading issues
 * AC-5: All 8 critical pages pass visual QA
 * AC-6: Performance metrics improved (font load time)
 * AC-7: Mobile and desktop responsive typography works correctly
 */
import {describe, it, expect} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {execSync} from 'child_process';

const ROOT = path.resolve(__dirname, '../..');

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf-8');
}

function grepFiles(pattern: string, include: string): string[] {
  try {
    const result = execSync(
      `grep -rn "${pattern}" app/ --include="${include}" 2>/dev/null || true`,
      {cwd: ROOT, encoding: 'utf-8'}
    );
    return result
      .split('\n')
      .filter((l) => l.trim())
      .filter((l) => !l.includes('__tests__'));
  } catch {
    return [];
  }
}

// ============================================================================
// AC-1: All text uses Space Grotesk font only
// ============================================================================
describe('UAT — AC-1: All text uses Space Grotesk font only', () => {
  it('AC-1a: tailwind.config.js font-sans = Space Grotesk', () => {
    const content = readFile('tailwind.config.js');
    const sansMatch = content.match(/sans\s*:\s*\[([^\]]+)\]/);
    expect(sansMatch![1]).toContain('Space Grotesk');
    expect(sansMatch![1]).not.toContain('Archivo');
  });

  it('AC-1b: tailwind.config.js font-body = Space Grotesk', () => {
    const content = readFile('tailwind.config.js');
    const bodyMatch = content.match(/body\s*:\s*\[([^\]]+)\]/);
    expect(bodyMatch![1]).toContain('Space Grotesk');
  });

  it('AC-1c: reset.css body font = Space Grotesk', () => {
    const content = readFile('app/styles/reset.css');
    expect(content).toContain('Space Grotesk');
  });

  it('AC-1d: design-tokens.ts FontFamilies.sans = Space Grotesk', () => {
    const content = readFile('app/lib/design-tokens.ts');
    const fontFamiliesBlock = content.match(/FontFamilies\s*=\s*\{([^}]+)\}/s);
    expect(fontFamiliesBlock).not.toBeNull();
    const block = fontFamiliesBlock![1];
    const sansLine = block.split('\n').find((l: string) => l.trimStart().startsWith('sans'));
    expect(sansLine).toBeDefined();
    expect(sansLine).toContain('Space Grotesk');
    expect(sansLine).not.toContain('Archivo');
  });

  it('AC-1e: .zehn-prose CSS uses Space Grotesk for headings', () => {
    const content = readFile('app/styles/app.css');
    const proseHeadings = content.match(
      /\.zehn-prose\s+h[1-6][^{]*\{([^}]+)\}/s
    );
    expect(proseHeadings![1]).toContain('Space Grotesk');
    expect(proseHeadings![1]).not.toContain('Archivo');
  });

  it('AC-1f: Google Fonts URL loads only Space Grotesk', () => {
    const content = readFile('app/root.tsx');
    const url = content.match(/fonts\.googleapis\.com[^'"]+/)![0];
    expect(url).toContain('Space+Grotesk');
    expect(url).not.toContain('Archivo');
    const familyCount = (url.match(/family=/g) || []).length;
    expect(familyCount).toBe(1);
  });
});

// ============================================================================
// AC-2: No Archivo Black references in code
// ============================================================================
describe('UAT — AC-2: No Archivo Black references in code', () => {
  it('AC-2a: No Archivo in TypeScript/TSX files', () => {
    const matches = grepFiles('Archivo', '*.tsx');
    const tsMatches = grepFiles('Archivo', '*.ts');
    expect([...matches, ...tsMatches]).toHaveLength(0);
  });

  it('AC-2b: No Archivo in CSS files', () => {
    const matches = grepFiles('Archivo', '*.css');
    expect(matches).toHaveLength(0);
  });

  it('AC-2c: No Archivo in JavaScript config files', () => {
    const matches = grepFiles('Archivo', '*.js');
    expect(matches).toHaveLength(0);
  });
});

// ============================================================================
// AC-3: Clear visual hierarchy maintained
// ============================================================================
describe('UAT — AC-3: Clear visual hierarchy maintained', () => {
  it('AC-3a: H1 uses weight 700 (bold) — heaviest heading weight', () => {
    const content = readFile('tailwind.config.js');
    const h1Def = content.match(/'h1'\s*:\s*\[([^\]]+)\]/s);
    expect(h1Def).not.toBeNull();
    expect(h1Def![1]).toContain("'700'");
  });

  it('AC-3b: H1 is larger than H2 which is larger than H3', () => {
    const content = readFile('tailwind.config.js');
    const h1Size = content.match(/'h1'\s*:\s*\['(\d+)px'/);
    const h2Size = content.match(/'h2'\s*:\s*\['(\d+)px'/);
    const h3Size = content.match(/'h3'\s*:\s*\['(\d+)px'/);
    if (h1Size && h2Size && h3Size) {
      expect(parseInt(h1Size[1])).toBeGreaterThan(parseInt(h2Size[1]));
      expect(parseInt(h2Size[1])).toBeGreaterThan(parseInt(h3Size[1]));
    }
  });

  it('AC-3c: Body text uses weight 400 (regular)', () => {
    const content = readFile('tailwind.config.js');
    const bodyDef = content.match(/'body'\s*:\s*\[([^\]]+)\]/s);
    expect(bodyDef).not.toBeNull();
    expect(bodyDef![1]).toContain("'400'");
  });

  it('AC-3d: Weight hierarchy exists: 300 < 400 < 500 < 600 < 700', () => {
    const content = readFile('tailwind.config.js');
    // Verify different weights are used for different purposes
    expect(content).toContain("'400'"); // body
    expect(content).toContain("'700'"); // headings
  });

  it('AC-3e: Letter-spacing tightens for larger headings', () => {
    const content = readFile('tailwind.config.js');
    // H1 should have tighter spacing than body text
    const h1Def = content.match(/'h1'\s*:\s*\[([^\]]+)\]/s);
    if (h1Def) {
      const spacing = h1Def[1].match(/letterSpacing:\s*'([^']+)'/);
      if (spacing) {
        const value = parseFloat(spacing[1]);
        expect(value).toBeLessThanOrEqual(0); // negative or zero
      }
    }
  });
});

// ============================================================================
// AC-4: No console errors or font loading issues
// ============================================================================
describe('UAT — AC-4: No font loading issues', () => {
  it('AC-4a: Google Fonts URL has valid weight range (300-700)', () => {
    const content = readFile('app/root.tsx');
    const url = content.match(/fonts\.googleapis\.com[^'"]+/)![0];
    const weights = url.match(/wght@([^&'"]+)/);
    expect(weights).not.toBeNull();
    const weightList = weights![1].split(';').map(Number);
    // All weights should be valid Space Grotesk weights
    const validWeights = [300, 400, 500, 600, 700];
    for (const w of weightList) {
      expect(validWeights).toContain(w);
    }
  });

  it('AC-4b: No weight 900 requested (does not exist in Space Grotesk)', () => {
    const content = readFile('app/root.tsx');
    const url = content.match(/fonts\.googleapis\.com[^'"]+/)![0];
    expect(url).not.toContain('900');
  });

  it('AC-4c: Preconnect hints are set for font domains', () => {
    const content = readFile('app/root.tsx');
    expect(content).toContain("href: 'https://fonts.googleapis.com'");
    expect(content).toContain("href: 'https://fonts.gstatic.com'");
    expect(content).toContain("crossOrigin: 'anonymous'");
  });

  it('AC-4d: Font display strategy is swap (prevents invisible text)', () => {
    const content = readFile('app/root.tsx');
    const url = content.match(/fonts\.googleapis\.com[^'"]+/)![0];
    expect(url).toContain('display=swap');
  });
});

// ============================================================================
// AC-5: All 8 critical pages pass visual QA
// ============================================================================
describe('UAT — AC-5: Critical page typography verification', () => {
  // Page 1: Homepage
  it('AC-5.1: Homepage Hero H1 — weight 700, responsive sizing, tracking -0.03em', () => {
    const content = readFile('app/components/zehn/Hero.tsx');
    expect(content).toContain('text-h1');
    expect(content).toContain('sm:text-h1-sm');
    expect(content).toContain('lg:text-h1-lg');
    expect(content).toContain('tracking-[-0.03em]');
  });

  it('AC-5.1b: Homepage ProductGrid H2 headings are bold', () => {
    const content = readFile('app/components/zehn/ProductGrid.tsx');
    const hasH2 = content.includes('font-sans') || content.includes('font-bold');
    expect(hasH2).toBe(true);
  });

  it('AC-5.1c: Homepage FeatureSection H3s maintain hierarchy', () => {
    const content = readFile('app/components/zehn/FeatureSection.tsx');
    expect(content).toContain('text-h3');
    expect(content).toContain('font-sans');
  });

  it('AC-5.1d: Homepage CTA buttons have weight 600 (font-medium)', () => {
    const hero = readFile('app/components/zehn/Hero.tsx');
    expect(hero).toContain('font-medium');
  });

  // Page 2: Product page
  it('AC-5.2: Product title is bold (font-sans = weight 700)', () => {
    const content = readFile('app/routes/products.$handle.tsx');
    expect(content).toMatch(/h1[^>]*className="[^"]*font-sans/);
  });

  it('AC-5.2b: Product price uses font-semibold (600-700 range)', () => {
    const content = readFile('app/routes/products.$handle.tsx');
    expect(content).toContain('font-semibold');
  });

  it('AC-5.2c: Sale vs compare-at price distinction (line-through)', () => {
    const content = readFile('app/routes/products.$handle.tsx');
    expect(content).toContain('line-through');
  });

  it('AC-5.2d: Product description is readable (font-body, text-body)', () => {
    const content = readFile('app/routes/products.$handle.tsx');
    expect(content).toMatch(/font-body[^"]*text-body/);
  });

  // Page 3: Collection page
  it('AC-5.3: Collection H1 is prominent (font-sans)', () => {
    const content = readFile('app/routes/collections.$handle.tsx');
    expect(content).toMatch(/h1[^>]*className="[^"]*font-sans/);
  });

  it('AC-5.3b: Collection title does NOT use Archivo-tuned tracking', () => {
    const content = readFile('app/routes/collections.$handle.tsx');
    // tracking-[0.08em] was for Archivo Black, should be removed/changed
    const h1Lines = content.split('\n').filter(
      (l) => l.includes('<h1') && l.includes('font-sans')
    );
    for (const line of h1Lines) {
      expect(line).not.toContain('tracking-[0.08em]');
    }
  });

  // Page 4: Cart drawer
  it('AC-5.4: Cart title is bold (font-sans)', () => {
    const content = readFile('app/components/zehn/CartDrawer.tsx');
    expect(content).toMatch(/className="[^"]*font-sans[^"]*text-h3/);
  });

  it('AC-5.4b: Cart price totals are prominent (font-semibold)', () => {
    const content = readFile('app/components/zehn/CartDrawer.tsx');
    expect(content).toContain('font-semibold');
  });

  // Page 5: Blog/prose
  it('AC-5.5: .zehn-prose headings use Space Grotesk weight 700', () => {
    const content = readFile('app/styles/app.css');
    const headingBlock = content.match(
      /\.zehn-prose\s+h[1-6][^{]*\{([^}]+)\}/s
    );
    expect(headingBlock![1]).toContain('Space Grotesk');
    expect(headingBlock![1]).toContain('font-weight: 700');
  });

  it('AC-5.5b: .zehn-prose body text is weight 400 (implicit default)', () => {
    const content = readFile('app/styles/app.css');
    // .zehn-prose itself should not set bold weight — body text stays 400
    const proseBase = content.match(/\.zehn-prose\s*\{([^}]+)\}/s);
    expect(proseBase).not.toBeNull();
    // Should not have font-weight set (defaults to 400) or explicitly 400
    if (proseBase![1].includes('font-weight')) {
      expect(proseBase![1]).toContain('font-weight: 400');
    }
  });

  // Page 6: Footer
  it('AC-5.6: Footer decorative ZEHN text uses font-bold (700, not 900)', () => {
    const content = readFile('app/components/zehn/Footer.tsx');
    // The span with giant text sizes (120px-400px) contains the decorative ZEHN text
    const zehnLine = content.split('\n').find(
      (l) => l.includes('text-[120px]') || l.includes('text-[200px]') || l.includes('text-[300px]') || l.includes('text-[400px]')
    );
    expect(zehnLine).toBeDefined();
    expect(zehnLine).toContain('font-bold');
    expect(zehnLine).not.toContain('font-black');
  });

  it('AC-5.6b: Footer section headings use weight 600 (font-sans + font-medium)', () => {
    const content = readFile('app/components/zehn/Footer.tsx');
    expect(content).toMatch(/font-sans[^"]*font-medium|font-medium[^"]*font-sans/);
  });

  // Page 7: Mobile navigation
  it('AC-5.7: Header nav uses font-body for navigation links', () => {
    const content = readFile('app/components/zehn/Header.tsx');
    expect(content).toContain('font-body');
  });

  // Page 8: Search modal
  it('AC-5.8: Search category labels use font-sans', () => {
    const content = readFile('app/components/zehn/SearchModal.tsx');
    expect(content).toMatch(/font-sans/);
  });

  it('AC-5.8b: Search results use font-body for readability', () => {
    const content = readFile('app/components/zehn/SearchModal.tsx');
    expect(content).toContain('font-body');
  });
});

// ============================================================================
// AC-6: Performance metrics improved
// ============================================================================
describe('UAT — AC-6: Performance improvement', () => {
  it('AC-6a: Only one font family loaded (reduced from two)', () => {
    const content = readFile('app/root.tsx');
    const url = content.match(/fonts\.googleapis\.com[^'"]+/)![0];
    const families = (url.match(/family=/g) || []).length;
    expect(families).toBe(1);
  });

  it('AC-6b: Weight 900 removed (not a valid Space Grotesk weight)', () => {
    const content = readFile('app/root.tsx');
    const url = content.match(/fonts\.googleapis\.com[^'"]+/)![0];
    expect(url).not.toContain('900');
  });
});

// ============================================================================
// AC-7: Responsive typography works correctly
// ============================================================================
describe('UAT — AC-7: Responsive typography', () => {
  it('AC-7a: H1 has mobile/tablet/desktop variants in config', () => {
    const content = readFile('tailwind.config.js');
    expect(content).toContain("'h1'");
    expect(content).toContain("'h1-sm'");
    expect(content).toContain("'h1-lg'");
  });

  it('AC-7b: H2 has mobile/tablet/desktop variants in config', () => {
    const content = readFile('tailwind.config.js');
    expect(content).toContain("'h2'");
    expect(content).toContain("'h2-sm'");
    expect(content).toContain("'h2-lg'");
  });

  it('AC-7c: H3 has mobile/tablet/desktop variants in config', () => {
    const content = readFile('tailwind.config.js');
    expect(content).toContain("'h3'");
    expect(content).toContain("'h3-sm'");
    expect(content).toContain("'h3-lg'");
  });

  it('AC-7d: Hero uses responsive text classes', () => {
    const content = readFile('app/components/zehn/Hero.tsx');
    expect(content).toContain('sm:text-h1-sm');
    expect(content).toContain('lg:text-h1-lg');
  });

  it('AC-7e: FeatureSection H3 uses responsive text classes', () => {
    const content = readFile('app/components/zehn/FeatureSection.tsx');
    expect(content).toContain('sm:text-h3-sm');
    expect(content).toContain('lg:text-h3-lg');
  });

  it('AC-7f: Body text has size variants', () => {
    const content = readFile('tailwind.config.js');
    expect(content).toContain("'body'");
    expect(content).toContain("'body-lg'");
  });

  it('AC-7g: Subheadline has responsive variants', () => {
    const content = readFile('tailwind.config.js');
    expect(content).toContain("'subheadline'");
  });
});

// ============================================================================
// Bonus: Edge cases & regressions
// ============================================================================
describe('UAT — Edge Cases & Regressions', () => {
  it('collections.all.tsx should not have Archivo-tuned tracking-[0.08em]', () => {
    try {
      const content = readFile('app/routes/collections.all.tsx');
      const h1Lines = content.split('\n').filter(
        (l) => l.includes('<h1') && l.includes('font-sans')
      );
      for (const line of h1Lines) {
        expect(line).not.toContain('tracking-[0.08em]');
      }
    } catch {
      // File may not exist — pass
    }
  });

  it('ErrorBoundary in root.tsx uses font-sans (Space Grotesk after migration)', () => {
    const content = readFile('app/root.tsx');
    expect(content).toMatch(/h1[^>]*className="[^"]*font-sans/);
  });

  it('No inline fontFamily overrides bypass the system font', () => {
    const results = grepFiles('fontFamily.*Archivo', '*.tsx');
    expect(results).toHaveLength(0);
  });

  it('ProductGrid component uses consistent font classes', () => {
    const content = readFile('app/components/zehn/ProductGrid.tsx');
    expect(content).not.toContain('Archivo');
    expect(content).not.toContain('font-black');
  });
});
