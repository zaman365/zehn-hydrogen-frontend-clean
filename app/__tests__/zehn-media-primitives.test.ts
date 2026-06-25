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

  it('exports sliderCard 3/4 ratio for standalone ProductSlider portrait cards', () => {
    expect(tokens).toContain('sliderCard');
    expect(tokens).toContain('aspect-[3/4]');
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
    /* fetchpriority lowercase — React 18 warns on camelCase fetchPriority (Prompt G) */
    expect(img).toContain("fetchpriority: 'high'");
  });

  it('uses native <img> (not Hydrogen Image)', () => {
    expect(img).not.toContain("from '@shopify/hydrogen'");
    expect(img).toContain('<img');
  });
});

// ============================================================================
// Phase 3 — component migration checks (file-content)
// ============================================================================
describe('Phase 3 — ProductItem migration', () => {
  const src = read('app/components/ProductItem.tsx');

  it('uses ZehnMediaFrame with product aspect', () => {
    expect(src).toContain('ZehnMediaFrame');
    expect(src).toContain("aspect=\"product\"");
  });

  it('uses ZehnShopifyImage with required sizes', () => {
    expect(src).toContain('ZehnShopifyImage');
    expect(src).toContain('sizes=');
  });

  it('maps isEager to isLCP prop', () => {
    expect(src).toContain('isLCP={isEager}');
  });

  it('no longer contains manual imageLoaded state', () => {
    expect(src).not.toContain('imageLoaded');
  });

  it('no longer imports Image from @shopify/hydrogen directly', () => {
    // Image is now used internally by ZehnShopifyImage
    expect(src).not.toMatch(/import.*\bImage\b.*from '@shopify\/hydrogen'/);
  });
});

describe('Phase 3 — CompactProductCard migration', () => {
  const src = read('app/components/CompactProductCard.tsx');

  it('uses ZehnMediaFrame with square aspect', () => {
    expect(src).toContain('ZehnMediaFrame');
    expect(src).toContain("aspect=\"square\"");
  });

  it('uses ZehnShopifyImage', () => {
    expect(src).toContain('ZehnShopifyImage');
  });

  it('no longer imports Image from @shopify/hydrogen directly', () => {
    expect(src).not.toMatch(/import.*\bImage\b.*from '@shopify\/hydrogen'/);
  });
});

describe('Phase 3 — ProductSlider migration', () => {
  const src = read('app/components/zehn/ProductSlider.tsx');

  it('uses ZehnMediaFrame with sliderCard aspect', () => {
    expect(src).toContain('ZehnMediaFrame');
    expect(src).toContain("aspect=\"sliderCard\"");
  });

  it('uses ZehnStaticImage', () => {
    expect(src).toContain('ZehnStaticImage');
  });

  it('no longer uses raw <img> for product images', () => {
    // ZehnStaticImage wraps the img internally; no raw img tag for product images
    expect(src).not.toContain('<img\n');
    expect(src).not.toContain("<img ");
  });
});

describe('Phase 3 — Hero migration', () => {
  const src = read('app/components/zehn/Hero.tsx');

  it('uses ZehnStaticImage for slide images', () => {
    expect(src).toContain('ZehnStaticImage');
  });

  it('passes isLCP for first slide (LCP candidate)', () => {
    expect(src).toContain('isLCP={index === 0}');
  });

  it('disables skeleton pulse under frosted nav (static hero-fold bg)', () => {
    expect(src).toContain('skeletonPulse={false}');
    expect(src).toContain('skeletonClassName="bg-[var(--hero-fold-bg)]"');
  });

  it('preloads all carousel images on mount', () => {
    expect(src).toContain('new Image()');
  });

  it('HeroSliderImage component deleted (inlined into ZehnStaticImage)', () => {
    expect(src).not.toContain('HeroSliderImage');
  });

  it('preserves fallback onError handler', () => {
    expect(src).toContain('fallbackApplied');
    expect(src).toContain('fallbackSrc');
  });
});

// ============================================================================
// Phase 3 P1 — component migration checks (file-content)
// ============================================================================
describe('Phase 3 P1 — CategoryTiles migration', () => {
  const src = read('app/components/zehn/CategoryTiles.tsx');

  it('uses ZehnStaticImage for category tile images', () => {
    expect(src).toContain('ZehnStaticImage');
  });

  it('no longer uses raw <img> for tile images', () => {
    // ZehnStaticImage wraps the img internally
    expect(src).not.toContain('<img');
  });

  it('imports ZehnStaticImage from zehn barrel', () => {
    expect(src).toContain("from '~/components/zehn'");
  });
});

describe('Phase 3 P1 — CartDrawer migration', () => {
  const src = read('app/components/zehn/CartDrawer.tsx');

  it('uses ZehnShopifyImage for line item thumbnails', () => {
    expect(src).toContain('ZehnShopifyImage');
  });

  it('no longer imports Image from @shopify/hydrogen directly', () => {
    expect(src).not.toMatch(/import.*\bImage\b.*from ['"]@shopify\/hydrogen['"]/);
  });

  it('passes sizes="96px" to ZehnShopifyImage (thumbnail size)', () => {
    expect(src).toContain('sizes="96px"');
  });
});

describe('Phase 3 P1 — SearchModal dead import cleanup', () => {
  const src = read('app/components/zehn/SearchModal.tsx');

  it('no longer imports Image from @shopify/hydrogen (dead import)', () => {
    expect(src).not.toMatch(/import.*\bImage\b.*from ['"]@shopify\/hydrogen['"]/);
  });

  it('no longer imports Money from @shopify/hydrogen (dead import)', () => {
    expect(src).not.toMatch(/import.*\bMoney\b.*from ['"]@shopify\/hydrogen['"]/);
  });

  it('renders products via CompactProductCard (already ZehnShopifyImage)', () => {
    expect(src).toContain('CompactProductCard');
  });
});

// ============================================================================
// Phase 3 P2 — marketing/editorial component migration checks
// ============================================================================
describe('Phase 3 P2 — FeatureSectionSplit migration', () => {
  const src = read('app/components/zehn/FeatureSectionSplit.tsx');

  it('uses ZehnStaticImage for banner images', () => {
    expect(src).toContain('ZehnStaticImage');
  });

  it('no longer uses raw <img> for banner images', () => {
    expect(src).not.toContain('<img');
  });

  it('passes object-contain className for banner1 proportions', () => {
    expect(src).toContain('object-contain');
  });
});

describe('Phase 3 P2 — FeaturedBento migration', () => {
  const src = read('app/components/zehn/FeaturedBento.tsx');

  it('uses ZehnStaticImage for bento tile images', () => {
    expect(src).toContain('ZehnStaticImage');
  });

  it('no longer uses raw <img> for tile images', () => {
    expect(src).not.toContain('<img');
  });
});

describe('Phase 3 P2 — CTABanner migration', () => {
  const src = read('app/components/zehn/CTABanner.tsx');

  it('uses ZehnStaticImage for background image', () => {
    expect(src).toContain('ZehnStaticImage');
  });

  it('no longer uses raw <img> for background', () => {
    expect(src).not.toContain('<img');
  });
});

describe('Phase 3 P2 — CategoryCarousel migration', () => {
  const src = read('app/components/zehn/CategoryCarousel.tsx');

  it('uses ZehnStaticImage for category slide images', () => {
    expect(src).toContain('ZehnStaticImage');
  });

  it('no longer uses raw <img> for category images', () => {
    expect(src).not.toContain('<img');
  });
});

describe('Phase 3 P2 — CollectionSlider migration', () => {
  const src = read('app/components/zehn/CollectionSlider.tsx');

  it('uses ZehnStaticImage for collection images', () => {
    expect(src).toContain('ZehnStaticImage');
  });

  it('no longer uses raw <img> for collection images', () => {
    expect(src).not.toContain('<img');
  });
});

describe('Phase 3 P2 — Testimonials migration', () => {
  const src = read('app/components/zehn/Testimonials.tsx');

  it('uses ZehnStaticImage for avatar thumbnails', () => {
    expect(src).toContain('ZehnStaticImage');
  });

  it('avatar container has relative class (required for absolute skeleton/img)', () => {
    // ZehnStaticImage renders absolute children; container must be relative
    expect(src).toContain('relative w-12 h-12 rounded-full');
  });

  it('no longer uses raw <img> for avatars', () => {
    expect(src).not.toContain('<img');
  });
});

describe('Phase 3 P2 — ZehnClubPage migration', () => {
  const src = read('app/components/zehn/ZehnClubPage.tsx');

  it('uses ZehnStaticImage for club logo', () => {
    expect(src).toContain('ZehnStaticImage');
  });

  it('logo wrapped in relative aspect-square container for ZehnStaticImage', () => {
    expect(src).toContain('aspect-square');
    expect(src).toContain('overflow-hidden');
  });

  it('no longer uses raw <img> for logo', () => {
    expect(src).not.toContain('<img');
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
