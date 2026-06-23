import {describe, expect, it} from 'vitest';
import {
  ZEHN_HOMEPAGE_GRID_TOP,
  ZEHN_HOMEPAGE_INSET_PY,
  ZEHN_HOMEPAGE_ROW_GAP,
  ZEHN_HOMEPAGE_SECTION_PY,
  ZEHN_HOMEPAGE_STACK_GAP,
} from '~/lib/homepage-section-styles';

describe('homepage-section-styles', () => {
  it('exports fixed band py token', () => {
    expect(ZEHN_HOMEPAGE_SECTION_PY).toBe('py-4 lg:py-6');
  });

  it('exports ART-0048 filter rhythm tokens', () => {
    expect(ZEHN_HOMEPAGE_INSET_PY).toBe('py-2 lg:py-4');
    expect(ZEHN_HOMEPAGE_ROW_GAP).toBe('gap-3 lg:gap-4');
    expect(ZEHN_HOMEPAGE_STACK_GAP).toBe('space-y-3 lg:space-y-4');
    expect(ZEHN_HOMEPAGE_GRID_TOP).toBe('mt-4 lg:mt-6');
  });
});
