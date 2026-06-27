/**
 * UNIT TESTS — zehn-product-image-loading.ts (BL-0020).
 */
import {describe, expect, it} from 'vitest';
import {
  resolveProductImageLoading,
  ZEHN_HOMEPAGE_SLIDER_SIZES,
} from '~/lib/zehn-product-image-loading';

describe('zehn-product-image-loading — horizontalSlider (BL-0020)', () => {
  it('returns skipSkeleton: true for all slider cards', () => {
    expect(resolveProductImageLoading('horizontalSlider', 0)).toEqual({
      loading: 'eager',
      priority: true,
      isLCP: false,
      skipSkeleton: true,
    });
    expect(resolveProductImageLoading('horizontalSlider', 12)).toEqual({
      loading: 'eager',
      priority: true,
      isLCP: false,
      skipSkeleton: true,
    });
  });

  it('exports homepage slider sizes constant', () => {
    expect(ZEHN_HOMEPAGE_SLIDER_SIZES).toBe('280px');
  });
});
