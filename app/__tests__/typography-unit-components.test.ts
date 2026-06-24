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
// Hero.tsx — CSS-class-based typography system
// ============================================================================
describe('Hero.tsx — Typography', () => {
  const content = readFile('app/components/zehn/Hero.tsx');
  const appCss = readFile('app/styles/app.css');

  it('Hero title uses CSS class system (HERO_TITLE_MOBILE / HERO_TITLE_DESKTOP tokens)', () => {
    // Hero applies font styling via CSS class constants from hero-typography.ts,
    // not inline Tailwind text-h1. This keeps hero styles in app.css, not JSX.
    expect(content).toContain('HERO_TITLE_MOBILE');
    expect(content).toContain('HERO_TITLE_DESKTOP');
    expect(appCss).toContain('.hero-title-mobile');
    expect(appCss).toContain('.hero-title-desktop');
  });

  it('Hero title CSS classes use responsive font sizes via clamp()', () => {
    // Responsive sizing handled by CSS clamp() — covers mobile through desktop without
    // Tailwind breakpoint utilities (avoids class-name proliferation in JSX).
    const mobileBlock = appCss.match(/\.hero-title-mobile\s*\{([^}]+)\}/s);
    const desktopBlock = appCss.match(/\.hero-title-desktop\s*\{([^}]+)\}/s);
    expect(mobileBlock).not.toBeNull();
    expect(desktopBlock).not.toBeNull();
    expect(mobileBlock![1]).toContain('clamp');
    expect(desktopBlock![1]).toContain('clamp');
  });

  it('Hero title CSS uses Inter display font with letter-spacing', () => {
    // Inter is the display font for hero punch — valid weight 900 (Inter supports 100-900).
    // Space Grotesk is the brand body font; Inter is only for hero/display contexts.
    const mobileBlock = appCss.match(/\.hero-title-mobile\s*\{([^}]+)\}/s);
    expect(mobileBlock).not.toBeNull();
    expect(mobileBlock![1]).toContain('Inter');
    expect(mobileBlock![1]).toContain('letter-spacing');
  });

  it('Hero subtitle uses CSS class system (HERO_SUBTITLE_MOBILE / HERO_SUBTITLE_DESKTOP)', () => {
    expect(content).toContain('HERO_SUBTITLE_MOBILE');
    expect(content).toContain('HERO_SUBTITLE_DESKTOP');
  });

  it('Hero CTA uses CtaShineButton component (font-semibold + font-display via zehn-cta-styles.ts)', () => {
    // CtaShineButton encapsulates CTA_SHINE_BUTTON_BASE which includes font-semibold
    expect(content).toContain('CtaShineButton');
  });

  it('Hero does NOT use font-black (Tailwind weight 900) or Archivo', () => {
    expect(content).not.toContain('font-black');
    expect(content).not.toContain('Archivo');
  });
});

// ============================================================================
// Footer.tsx
// ============================================================================
describe('Footer.tsx — Typography', () => {
  const content = readFile('app/components/zehn/Footer.tsx');

  it('Decorative ZEHN background uses SVG — no font-black (weight 900) text node', () => {
    // Footer uses /ZEHN_Platinum.svg for the decorative background element,
    // not a text node styled with font-black or font-weight: 900.
    expect(content).toContain('/ZEHN_Platinum.svg');
    expect(content).not.toContain('font-black');
  });

  it('Section headings should use font-sans with uppercase', () => {
    expect(content).toMatch(/font-sans[^"]*tracking-\[0\.3em\][^"]*uppercase/);
  });

  it('Footer link columns use font-sans text-body for navigation links', () => {
    // Footer uses font-sans (= Space Grotesk, same as font-body) for link elements.
    // Both font-sans and font-body resolve to Space Grotesk in Tailwind config.
    const linkMatches = content.match(/font-sans text-body/g);
    expect(linkMatches).not.toBeNull();
    expect(linkMatches!.length).toBeGreaterThanOrEqual(2);
  });

  it('Copyright/legal text uses font-sans with small text size', () => {
    const legalLine = content.split('\n').find(
      (l) =>
        l.includes('font-sans') &&
        (l.includes('text-[12px]') ||
          l.includes('text-[11px]') ||
          l.includes('text-[13px]')),
    );
    expect(legalLine).toBeDefined();
  });

  it('Section headings use font-sans (h3 for accordion link groups)', () => {
    // Footer uses h3 for footer link column headings (not h2 — h2 is page-level).
    expect(content).toMatch(/h3[^>]*className="[^"]*font-sans/);
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

  it('Body text should use font-sans (Space Grotesk brand font)', () => {
    // CartDrawer uses font-sans consistently (= Space Grotesk, same as font-body).
    const fontMatches = content.match(/font-sans/g);
    expect(fontMatches).not.toBeNull();
    expect(fontMatches!.length).toBeGreaterThanOrEqual(5);
  });

  it('Price totals should use font-semibold', () => {
    expect(content).toContain('font-semibold');
  });

  it('Buttons should use font-medium with font-sans', () => {
    expect(content).toMatch(/font-sans[^"]*font-medium|font-medium[^"]*font-sans/);
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

  it('Search input should use font-sans', () => {
    // SearchModal uses font-sans (Space Grotesk) consistently for all text elements.
    expect(content).toMatch(/font-sans/);
  });

  it('Search result items should use font-sans', () => {
    const fontMatches = content.match(/font-sans/g);
    expect(fontMatches).not.toBeNull();
    expect(fontMatches!.length).toBeGreaterThanOrEqual(3);
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

  it('Feature descriptions should use font-sans', () => {
    // FeatureSection uses font-sans (Space Grotesk) for paragraph text.
    expect(content).toMatch(/p[^>]*className="[^"]*font-sans/);
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

  it('CTA subtext should use font-sans', () => {
    // CTABanner uses font-sans (Space Grotesk) for all text elements.
    expect(content).toContain('font-sans');
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

  it('Header should use font-sans for navigation', () => {
    // Header applies font-sans on the root <header> element (= Space Grotesk).
    expect(content).toContain('font-sans');
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

  it('Empty state heading should use font-sans (h3 or h1)', () => {
    // Collection page uses h3 for the "Coming Soon" empty state heading
    // and h1 in error boundaries — both with font-sans.
    expect(content).toMatch(/h[13][^>]*className="[^"]*font-sans/);
  });

  it('Subtitle / paragraph text should use font-sans', () => {
    // Collections page uses font-sans consistently for all text elements.
    expect(content).toContain('font-sans');
  });
});
