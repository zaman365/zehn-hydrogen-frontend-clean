import {describe, expect, it} from 'vitest';
import {
  getTrustStripRevealDelayMs,
  HERO_REVEAL_STAGGER_MS,
  HERO_REVEAL_TITLE_DELAY_MS,
  TRUST_STRIP_REVEAL_BASE_DELAY_MS,
} from '~/lib/trust-strip-motion';

describe('trust-strip-motion', () => {
  it('starts trust strip with hero title at 0ms', () => {
    expect(HERO_REVEAL_STAGGER_MS).toBe(180);
    expect(HERO_REVEAL_TITLE_DELAY_MS).toBe(0);
    expect(TRUST_STRIP_REVEAL_BASE_DELAY_MS).toBe(0);
    expect(getTrustStripRevealDelayMs(0)).toBe(0);
    expect(getTrustStripRevealDelayMs(3)).toBe(540);
  });
});
