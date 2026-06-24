/**
 * UNIT TESTS — Phase 2 media primitives (ZehnMediaFrame, ZehnShopifyImage, ZehnStaticImage).
 * Verifies tokens, exports, and behaviour contracts without a DOM renderer.
 */
import {describe, it, expect} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf-8');
}

// ============================================================================
// zehn-media-styles.ts — token shape
// ============================================================================
describe('zehn-media-styles — tokens', () => {
  const tokens = read('app/lib/zehn-media-styles.ts');

  it('exports ZEHN_MEDIA_SKELETON with animate-pulse and bg-muted/40', () => {
    expect(tokens).toContain('animate-pulse');
    expect(tokens).toContain('bg-muted/40');
    expect(tokens).toContain('ZEHN_MEDIA_SKELETON');
  });

  it('exports ZEHN_MEDIA_ASPECT with product 7/10 ratio', () => {
    expect(tokens).toContain('ZEHN_MEDIA_ASPECT');
    expect(tokens).toContain('aspect-[7/10]');
  });

  it('exports ZEHN_MEDIA_ASPECT with hero 5/2 and heroMobile 4/5', () => {
    expect(tokens).toContain('aspect-[5/2]');
    expect(tokens).toContain('aspect-[4/5]');
  });

  it('exports ZEHN_MEDIA_FADE_IN with 700ms cubic ease', () => {
    expect(tokens).toContain('ZEHN_MEDIA_FADE_IN');
    expect(tokens).toContain('duration-700');
    expect(tokens).toContain('cubic-bezier');
  });

  it('exports ZehnMediaAspectKey type', () => {
    expect(tokens).toContain('ZehnMediaAspectKey');
  });
});

// ============================================================================
// ZehnMediaFrame.tsx — aspect class wiring
// ============================================================================
describe('ZehnMediaFrame — structure', () => {
  const frame = read('app/components/zehn/ZehnMediaFrame.tsx');

  it('applies ZEHN_MEDIA_ASPECT[aspect] to the container', () => {
    // Frame uses the aspect prop to index into ZEHN_MEDIA_ASPECT
    expect(frame).toContain('ZEHN_MEDIA_ASPECT[aspect]');
  });

  it('includes relative + overflow-hidden on the container', () => {
    expect(frame).toContain('relative');
    expect(frame).toContain('overflow-hidden');
  });

  it('accepts className override via cn()', () => {
    expect(frame).toContain('cn(');
    expect(frame).toContain('className');
  });

  it('imports from zehn-media-styles (token co-location)', () => {
    expect(frame).toContain('zehn-media-styles');
  });
});

// ============================================================================
// ZehnShopifyImage.tsx — skeleton + fade contract
// ============================================================================
describe('ZehnShopifyImage — behaviour contract', () => {
  const img = read('app/components/zehn/ZehnShopifyImage.tsx');

  it('requires sizes prop (enforced via TypeScript Omit + re-declare)', () => {
    // sizes is required — Omit<HydrogenImageBaseProps, 'sizes'> then re-added as required string
    expect(img).toContain("sizes: string");
  });

  it('skeleton rendered only when !isLCP', () => {
    expect(img).toContain('!isLCP');
    expect(img).toContain('ZEHN_MEDIA_SKELETON');
  });

  it('skeleton fades out on load (opacity-0 when loaded)', () => {
    expect(img).toContain("loaded ? 'opacity-0' : 'opacity-100'");
  });

  it('image applies ZEHN_MEDIA_FADE_IN', () => {
    expect(img).toContain('ZEHN_MEDIA_FADE_IN');
  });

  it('LCP images use loading=eager and fetchpriority=high', () => {
    expect(img).toContain("loading={isLCP ? 'eager' : 'lazy'}");
    expect(img).toContain("fetchpriority: 'high'");
  });

  it('wraps Hydrogen Image component', () => {
    expect(img).toContain("from '@shopify/hydrogen'");
    expect(img).toContain('<Image');
  });

  it('default isLCP is false (no skeleton skipped by accident)', () => {
    expect(img).toContain('isLCP = false');
  });
});

// ============================================================================
// ZehnStaticImage.tsx — same contract for static assets
// ============================================================================
describe('ZehnStaticImage — behaviour contract', () => {
  const img = read('app/components/zehn/ZehnStaticImage.tsx');

  it('src and alt are required props', () => {
    expect(img).toContain("src: string");
    expect(img).toContain("alt: string");
  });

  it('skeleton rendered only when !isLCP', () => {
    expect(img).toContain('!isLCP');
    expect(img).toContain('ZEHN_MEDIA_SKELETON');
  });

  it('skeleton fades out on load', () => {
    expect(img).toContain("loaded ? 'opacity-0' : 'opacity-100'");
  });

  it('image applies ZEHN_MEDIA_FADE_IN', () => {
    expect(img).toContain('ZEHN_MEDIA_FADE_IN');
  });

  it('LCP images use loading=eager and fetchPriority=high', () => {
    expect(img).toContain("loading={isLCP ? 'eager' : 'lazy'}");
    expect(img).toContain("fetchPriority={isLCP ? 'high' : 'auto'}");
  });

  it('uses native <img> (not Hydrogen Image)', () => {
    expect(img).not.toContain("from '@shopify/hydrogen'");
    expect(img).toContain('<img');
  });
});

// ============================================================================
// index.ts — all three primitives exported
// ============================================================================
describe('zehn/index.ts — media primitive exports', () => {
  const idx = read('app/components/zehn/index.ts');

  it('exports ZehnMediaFrame and its props type', () => {
    expect(idx).toContain('ZehnMediaFrame');
    expect(idx).toContain('ZehnMediaFrameProps');
  });

  it('exports ZehnShopifyImage and its props type', () => {
    expect(idx).toContain('ZehnShopifyImage');
    expect(idx).toContain('ZehnShopifyImageProps');
  });

  it('exports ZehnStaticImage and its props type', () => {
    expect(idx).toContain('ZehnStaticImage');
    expect(idx).toContain('ZehnStaticImageProps');
  });
});
