import {describe, expect, it} from 'vitest';
import {
  getNavStaggerDelayMs,
  getNavStaggerMaxDurationMs,
  NAV_STAGGER_ITEM_DELAY_MS,
  NAV_STAGGER_ITEM_DURATION_MS,
} from '~/lib/nav-stagger-motion';

describe('getNavStaggerDelayMs', () => {
  it('stair enter: index 0 → 0ms, index 2 → 90ms', () => {
    expect(getNavStaggerDelayMs(0, 5, 'enter')).toBe(0);
    expect(getNavStaggerDelayMs(2, 5, 'enter')).toBe(
      2 * NAV_STAGGER_ITEM_DELAY_MS,
    );
    expect(getNavStaggerDelayMs(2, 5, 'enter')).toBe(90);
  });

  it('reverse exit: last item exits first', () => {
    expect(getNavStaggerDelayMs(0, 5, 'exit')).toBe(4 * NAV_STAGGER_ITEM_DELAY_MS);
    expect(getNavStaggerDelayMs(4, 5, 'exit')).toBe(0);
  });

  it('idle and reduced motion → 0ms', () => {
    expect(getNavStaggerDelayMs(3, 5, 'idle')).toBe(0);
    expect(getNavStaggerDelayMs(3, 5, 'enter', true)).toBe(0);
  });
});

describe('getNavStaggerMaxDurationMs', () => {
  it('covers last stagger item plus duration', () => {
    expect(getNavStaggerMaxDurationMs(6)).toBe(
      5 * NAV_STAGGER_ITEM_DELAY_MS + NAV_STAGGER_ITEM_DURATION_MS,
    );
    expect(getNavStaggerMaxDurationMs(6)).toBe(445);
  });
});
