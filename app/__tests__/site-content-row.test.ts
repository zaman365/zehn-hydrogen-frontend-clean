import {describe, expect, it} from 'vitest';
import {ZEHN_SITE_CONTENT_ROW} from '~/lib/site-content-row';

describe('site-content-row', () => {
  it('exports navbar-aligned row token with max-w 1400px', () => {
    expect(ZEHN_SITE_CONTENT_ROW).toContain('max-w-[1400px]');
    expect(ZEHN_SITE_CONTENT_ROW).toContain('w-full');
    expect(ZEHN_SITE_CONTENT_ROW).toContain('mx-auto');
    expect(ZEHN_SITE_CONTENT_ROW).not.toContain('lg:w-[95%]');
    expect(ZEHN_SITE_CONTENT_ROW).not.toContain('w-[97.5%]');
  });
});
