/**
 * UNIT TESTS — Typography Migration: Configuration Files
 * Step 3: Verify all config files are correctly migrated to Space Grotesk only.
 */
import {describe, it, expect} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf-8');
}

// ============================================================================
// tailwind.config.js
// ============================================================================
describe('tailwind.config.js — Font Configuration', () => {
  const content = readFile('tailwind.config.js');

  it('should set font-sans to Space Grotesk (not Archivo Black)', () => {
    // After migration: sans should point to Space Grotesk
    const sansMatch = content.match(/sans\s*:\s*\[([^\]]+)\]/);
    expect(sansMatch).not.toBeNull();
    const sansValue = sansMatch![1];
    expect(sansValue).toContain('Space Grotesk');
    expect(sansValue).not.toContain('Archivo Black');
  });

  it('should set font-body to Space Grotesk', () => {
    const bodyMatch = content.match(/body\s*:\s*\[([^\]]+)\]/);
    expect(bodyMatch).not.toBeNull();
    expect(bodyMatch![1]).toContain('Space Grotesk');
  });

  it('should NOT use fontWeight 900 in any fontSize definition', () => {
    // Space Grotesk max weight is 700, weight 900 does not exist
    const weight900Matches = content.match(/fontWeight\s*:\s*['"]900['"]/g);
    expect(weight900Matches).toBeNull();
  });

  it('should use fontWeight 700 for heading definitions', () => {
    // All h1, h2, h3 variants should use weight 700
    const headingLines = content.split('\n').filter(
      (line) => /['"]h[1-3]/.test(line) || /fontWeight/.test(line)
    );
    const weight700Count = headingLines.filter((l) =>
      l.includes("'700'") || l.includes('"700"')
    ).length;
    // At least h1, h2, h3 base definitions = 3 weight 700 entries
    expect(weight700Count).toBeGreaterThanOrEqual(3);
  });

  it('should have proper H1 desktop letter-spacing of -0.03em', () => {
    // H1 lg variant should have -0.03em tracking per migration plan
    const h1LgSection = content.match(/'h1-lg'\s*:\s*\[([^\]]+)\]/s);
    if (h1LgSection) {
      expect(h1LgSection[1]).toContain('-0.03em');
    }
  });
});

// ============================================================================
// root.tsx — Self-Hosted Font Loading (Phase 1: performance / zero-flicker)
// ============================================================================
describe('root.tsx — Font Loading', () => {
  const content = readFile('app/root.tsx');
  const fontsContent = readFile('app/styles/fonts.css');

  it('should NOT load Archivo Black from Google Fonts', () => {
    expect(content).not.toContain('Archivo+Black');
    expect(content).not.toContain('Archivo Black');
  });

  it('should preload Space Grotesk from self-hosted WOFF2 (no Google Fonts CDN)', () => {
    // Phase 1: fonts are self-hosted in public/fonts/, preloaded via links()
    expect(content).toContain('/fonts/space-grotesk/space-grotesk-variable.woff2');
    expect(content).not.toContain('fonts.googleapis.com');
  });

  it('should NOT request weight 900 for Space Grotesk (variable font range is 300 700)', () => {
    // fonts.css @font-face for Space Grotesk uses variable range 300 700, no 900
    const sgBlocks = fontsContent.match(
      /font-family:\s*['"]Space Grotesk['"][^}]+}/gs,
    );
    expect(sgBlocks).not.toBeNull();
    for (const block of sgBlocks!) {
      expect(block).not.toContain(' 900');
      expect(block).toContain('300 700');
    }
  });

  it('should define Space Grotesk variable font covering weights 300-700', () => {
    // Variable @font-face syntax: font-weight: 300 700 covers all weights in one file
    expect(fontsContent).toContain('font-weight: 300 700');
  });

  it('should preload self-hosted WOFF2 with correct link rel attributes', () => {
    // Preload must declare as:font, type:font/woff2, crossOrigin:anonymous for CORS
    expect(content).toContain("as: 'font'");
    expect(content).toContain("type: 'font/woff2'");
    expect(content).toContain("crossOrigin: 'anonymous'");
    // No Google Fonts domains remain in root.tsx
    expect(content).not.toContain('fonts.googleapis.com');
    expect(content).not.toContain('fonts.gstatic.com');
  });
});

// ============================================================================
// design-tokens.ts
// ============================================================================
describe('design-tokens.ts — Typography Tokens', () => {
  const content = readFile('app/lib/design-tokens.ts');

  it('should set FontFamilies.sans to Space Grotesk', () => {
    // FontFamilies.sans uses format: sans: '"Space Grotesk", system-ui, sans-serif'
    const fontFamiliesBlock = content.match(/FontFamilies\s*=\s*\{([^}]+)\}/s);
    expect(fontFamiliesBlock).not.toBeNull();
    const block = fontFamiliesBlock![1];
    expect(block).toContain('Space Grotesk');
    expect(block).not.toContain('Archivo Black');
  });

  it('should set FontFamilies.body to Space Grotesk', () => {
    const fontFamiliesBlock = content.match(/FontFamilies\s*=\s*\{([^}]+)\}/s);
    expect(fontFamiliesBlock).not.toBeNull();
    const block = fontFamiliesBlock![1];
    const bodyLine = block.split('\n').find((l: string) => l.trimStart().startsWith('body'));
    expect(bodyLine).toBeDefined();
    expect(bodyLine).toContain('Space Grotesk');
  });

  it('should NOT have any fontWeight of 900', () => {
    const weight900 = content.match(/fontWeight\s*:\s*['"]900['"]/g);
    expect(weight900).toBeNull();
  });

  it('should use fontWeight 700 for h1 and h2 tokens', () => {
    // h1 and h2 should have fontWeight 700
    const h1Section = content.match(/h1\s*:\s*\{([^}]+)\}/s);
    const h2Section = content.match(/h2\s*:\s*\{([^}]+)\}/s);
    if (h1Section) expect(h1Section[1]).toContain("'700'");
    if (h2Section) expect(h2Section[1]).toContain("'700'");
  });
});

// ============================================================================
// reset.css
// ============================================================================
describe('reset.css — Base Font', () => {
  const content = readFile('app/styles/reset.css');

  it('should use Space Grotesk as the primary body font', () => {
    expect(content).toContain('Space Grotesk');
  });

  it('should NOT reference Archivo Black', () => {
    expect(content).not.toContain('Archivo Black');
    expect(content).not.toContain('Archivo');
  });
});

// ============================================================================
// app.css — .zehn-prose
// ============================================================================
describe('app.css — Prose Typography', () => {
  const content = readFile('app/styles/app.css');

  it('.zehn-prose headings should use Space Grotesk', () => {
    // Look for the heading rule block
    const headingRule = content.match(
      /\.zehn-prose\s+h[1-6][^{]*\{([^}]+)\}/s
    );
    if (headingRule) {
      expect(headingRule[1]).toContain('Space Grotesk');
      expect(headingRule[1]).not.toContain('Archivo Black');
    }
  });

  it('.zehn-prose headings should use font-weight 700', () => {
    const headingRule = content.match(
      /\.zehn-prose\s+h[1-6][^{]*\{([^}]+)\}/s
    );
    if (headingRule) {
      expect(headingRule[1]).toContain('font-weight: 700');
      expect(headingRule[1]).not.toContain('font-weight: 900');
    }
  });

  it('should NOT contain any Archivo Black references', () => {
    // After full migration, no Archivo references should remain
    const archivoCount = (content.match(/Archivo Black/g) || []).length;
    expect(archivoCount).toBe(0);
  });
});
