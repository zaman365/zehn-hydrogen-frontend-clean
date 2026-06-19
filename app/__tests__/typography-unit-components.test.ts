/**
 * UNIT TESTS — Typography Migration: Component Files
 * Step 3: Verify all components use correct font classes and weights post-migration.
 */
import {describe, it, expect} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf-8');
}

// Helper: extract all className strings from a TSX file
function extractClassNames(content: string): string[] {
  const matches = content.match(/className="[^"]*"/g) || [];
  return matches.map((m) => m.replace('className="', '').replace('"', ''));
}

// ============================================================================
// GLOBAL: No Archivo Black anywhere in codebase
// ============================================================================
describe('Global — No Archivo Black References', () => {
  const searchPaths = [
    'app/components/zehn/Hero.tsx',
    'app/components/zehn/Footer.tsx',
    'app/components/zehn/CartDrawer.tsx',
    'app/components/zehn/SearchModal.tsx',
    'app/components/zehn/Header.tsx',
    'app/components/zehn/ProductGrid.tsx',
    'app/components/zehn/FeatureSection.tsx',
    'app/components/zehn/CTABanner.tsx',
    'app/routes/_index.tsx',
    'app/routes/products.$handle.tsx',
    'app/routes/collections.$handle.tsx',
  ];

  for (const filePath of searchPaths) {
    it(`${filePath} should not contain "Archivo Black"`, () => {
      const content = readFile(filePath);
      expect(content).not.toContain('Archivo Black');
      expect(content).not.toContain('Archivo');
    });
  }
});

// ============================================================================
// GLOBAL: No font-weight 900 / font-black class
// ============================================================================
describe('Global — No Weight 900 or font-black Usage', () => {
  const componentFiles = [
    'app/components/zehn/Hero.tsx',
    'app/components/zehn/Footer.tsx',
    'app/components/zehn/CartDrawer.tsx',
    'app/components/zehn/SearchModal.tsx',
    'app/components/zehn/Header.tsx',
    'app/components/zehn/ProductGrid.tsx',
    'app/components/zehn/FeatureSection.tsx',
    'app/components/zehn/CTABanner.tsx',
  ];

  for (const filePath of componentFiles) {
    it(`${filePath} should not use font-black (weight 900) class`, () => {
      const content = readFile(filePath);
      const classNames = extractClassNames(content);
      for (const cn of classNames) {
        // font-black is Tailwind's weight 900 utility
        expect(cn).not.toMatch(/\bfont-black\b/);
      }
    });
  }
});

// ============================================================================
// Hero.tsx
// ============================================================================
describe('Hero.tsx — Typography', () => {
  const content = readFile('app/components/zehn/Hero.tsx');

  it('H1 should use font-sans class', () => {
    expect(content).toMatch(/h1\s+className="[^"]*font-sans/);
  });

  it('H1 should use responsive text sizes (text-h1 sm:text-h1-sm lg:text-h1-lg)', () => {
    expect(content).toContain('text-h1');
    expect(content).toContain('text-h1-sm');
    expect(content).toContain('text-h1-lg');
  });

  it('H1 should use tracking-[-0.03em] (not 0.08em from Archivo)', () => {
    expect(content).toContain('tracking-[-0.03em]');
    expect(content).not.toContain('tracking-[0.08em]');
  });

  it('Subheadline should use font-body class', () => {
    expect(content).toContain('font-body text-subheadline');
  });

  it('CTA button should use font-body with font-medium (weight 500)', () => {
    // Buttons use font-body per design system
    const ctaLink = content.match(/Link[^>]*className="[^"]*font-body[^"]*font-medium/);
    expect(ctaLink).not.toBeNull();
  });

  it('Trust badge text should use font-body', () => {
    const badges = content.match(/span[^>]*className="[^"]*font-body[^"]*text-xs/g);
    expect(badges).not.toBeNull();
    expect(badges!.length).toBeGreaterThanOrEqual(3);
  });
});

// ============================================================================
// Footer.tsx
// ============================================================================
describe('Footer.tsx — Typography', () => {
  const content = readFile('app/components/zehn/Footer.tsx');

  it('Decorative ZEHN text should use font-bold (not font-black/900)', () => {
    // The giant ZEHN watermark should be weight 700 (font-bold), not 900
    // The span with giant text sizes contains the ZEHN text on the next line
    const zehnLine = content.split('\n').find(
      (l) => l.includes('text-[120px]') || l.includes('text-[200px]') || l.includes('text-[300px]') || l.includes('text-[400px]')
    );
    expect(zehnLine).toBeDefined();
    expect(zehnLine).toContain('font-bold');
    expect(zehnLine).not.toContain('font-black');
  });

  it('Section headings should use font-sans with uppercase', () => {
    expect(content).toMatch(/font-sans[^"]*tracking-\[0\.3em\][^"]*uppercase/);
  });

  it('Footer links should use font-body', () => {
    const linkMatches = content.match(/font-body[^"]*text-body/g);
    expect(linkMatches).not.toBeNull();
    expect(linkMatches!.length).toBeGreaterThanOrEqual(2);
  });

  it('Copyright/legal text should use font-body with small size', () => {
    const legalLine = content.split('\n').find(
      (l) => l.includes('font-body') && (l.includes('text-[12px]') || l.includes('text-[11px]') || l.includes('text-[13px]'))
    );
    expect(legalLine).toBeDefined();
  });

  it('Brand section heading should use font-sans', () => {
    expect(content).toMatch(/h2[^>]*className="[^"]*font-sans/);
  });
});

// ============================================================================
// CartDrawer.tsx
// ============================================================================
describe('CartDrawer.tsx — Typography', () => {
  const content = readFile('app/components/zehn/CartDrawer.tsx');

  it('Cart title should use font-sans', () => {
    expect(content).toMatch(/h2[^>]*className="[^"]*font-sans/);
  });

  it('Cart item names should use font-sans with font-medium', () => {
    // Product names in cart should be bold/medium
    expect(content).toMatch(/h3[^>]*className="[^"]*font-sans[^"]*font-medium/);
  });

  it('Body text should use font-body', () => {
    const bodyFontMatches = content.match(/font-body/g);
    expect(bodyFontMatches).not.toBeNull();
    expect(bodyFontMatches!.length).toBeGreaterThanOrEqual(5);
  });

  it('Price totals should use font-semibold', () => {
    expect(content).toContain('font-semibold');
  });

  it('Buttons should use font-medium with font-body', () => {
    expect(content).toMatch(/font-body[^"]*font-medium|font-medium[^"]*font-body/);
  });
});

// ============================================================================
// SearchModal.tsx
// ============================================================================
describe('SearchModal.tsx — Typography', () => {
  const content = readFile('app/components/zehn/SearchModal.tsx');

  it('Category section labels should use font-sans', () => {
    expect(content).toMatch(/h3[^>]*className="[^"]*font-sans/);
  });

  it('Search input should use font-body', () => {
    expect(content).toMatch(/font-body/);
  });

  it('Search result items should use font-body', () => {
    const bodyMatches = content.match(/font-body/g);
    expect(bodyMatches).not.toBeNull();
    expect(bodyMatches!.length).toBeGreaterThanOrEqual(3);
  });

  it('No font loading issues — no inline font-family overrides', () => {
    // Should not have inline style font-family that overrides the system
    expect(content).not.toMatch(/style=\{[^}]*fontFamily/);
  });
});

// ============================================================================
// FeatureSection.tsx
// ============================================================================
describe('FeatureSection.tsx — Typography', () => {
  const content = readFile('app/components/zehn/FeatureSection.tsx');

  it('Feature H3 headings should use font-sans with responsive sizes', () => {
    expect(content).toMatch(/h3[^>]*className="[^"]*font-sans[^"]*text-h3/);
  });

  it('Feature H3 should have responsive variants', () => {
    expect(content).toContain('text-h3');
    expect(content).toContain('text-h3-sm');
    expect(content).toContain('text-h3-lg');
  });

  it('Feature descriptions should use font-body', () => {
    expect(content).toMatch(/p[^>]*className="[^"]*font-body/);
  });
});

// ============================================================================
// CTABanner.tsx
// ============================================================================
describe('CTABanner.tsx — Typography', () => {
  const content = readFile('app/components/zehn/CTABanner.tsx');

  it('CTA headings should use font-sans', () => {
    expect(content).toMatch(/h3[^>]*className="[^"]*font-sans/);
  });

  it('CTA subtext should use font-body', () => {
    expect(content).toContain('font-body');
  });

  it('CTA body items should use proper text sizes', () => {
    expect(content).toContain('text-body');
  });
});

// ============================================================================
// Header.tsx — Mobile Navigation
// ============================================================================
describe('Header.tsx — Navigation Typography', () => {
  const content = readFile('app/components/zehn/Header.tsx');

  it('Header should use font-body for navigation', () => {
    expect(content).toContain('font-body');
  });

  it('Should NOT reference Archivo or weight 900', () => {
    expect(content).not.toContain('Archivo');
    expect(content).not.toContain('font-black');
  });
});

// ============================================================================
// Product Page
// ============================================================================
describe('products.$handle.tsx — Typography', () => {
  const content = readFile('app/routes/products.$handle.tsx');

  it('Product title (H1) should use font-sans', () => {
    expect(content).toMatch(/h1[^>]*className="[^"]*font-sans/);
  });

  it('Product price should use font-body with font-semibold', () => {
    expect(content).toMatch(/font-body[^"]*font-semibold/);
  });

  it('Compare-at price should use line-through styling', () => {
    expect(content).toContain('line-through');
  });

  it('Product description should use font-body with weight 400', () => {
    expect(content).toMatch(/font-body[^"]*text-body/);
  });

  it('Variant labels should use font-body with font-medium', () => {
    expect(content).toMatch(/font-body[^"]*font-medium/);
  });

  it('"Das könnte Ihnen auch gefallen" H2 should use font-sans', () => {
    expect(content).toMatch(/h2[^>]*className="[^"]*font-sans/);
  });
});

// ============================================================================
// Collection Page
// ============================================================================
describe('collections.$handle.tsx — Typography', () => {
  const content = readFile('app/routes/collections.$handle.tsx');

  it('Collection title (H1) should use font-sans', () => {
    expect(content).toMatch(/h1[^>]*className="[^"]*font-sans/);
  });

  it('Collection title should NOT use tracking-[0.08em] (Archivo tuning)', () => {
    // 0.08em was tuned for Archivo Black, should be updated for Space Grotesk
    const h1Lines = content.split('\n').filter(
      (l) => l.includes('<h1') && l.includes('font-sans')
    );
    for (const line of h1Lines) {
      expect(line).not.toContain('tracking-[0.08em]');
    }
  });

  it('Filter heading should use font-sans', () => {
    expect(content).toMatch(/h2[^>]*className="[^"]*font-sans/);
  });

  it('Subtitle text should use font-body', () => {
    expect(content).toContain('font-body');
  });
});
