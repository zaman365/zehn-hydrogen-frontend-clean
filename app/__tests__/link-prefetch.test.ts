/**
 * UNIT TESTS — link-prefetch.ts (Phase 7E / 7.1A).
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {resolveLinkPrefetch} from '~/lib/link-prefetch';

describe('link-prefetch', () => {
  const matchMediaMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('matchMedia', matchMediaMock);
    vi.stubGlobal('window', {matchMedia: matchMediaMock} as unknown as Window);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns viewport on touch (coarse pointer)', () => {
    matchMediaMock.mockReturnValue({matches: false});
    expect(resolveLinkPrefetch('nav')).toBe('viewport');
  });

  it('returns intent on desktop (fine pointer + hover)', () => {
    matchMediaMock.mockReturnValue({matches: true});
    expect(resolveLinkPrefetch('nav')).toBe('intent');
  });
});

describe('link-prefetch SSR', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to viewport when window is undefined', () => {
    vi.stubGlobal('window', undefined);
    expect(resolveLinkPrefetch('product')).toBe('viewport');
  });
});
