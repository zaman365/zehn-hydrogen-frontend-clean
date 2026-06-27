/**
 * UNIT TESTS — link-prefetch.ts (Phase 7E / 7.1A + catalog perf tier differentiation).
 *
 * Tier contract:
 *  product   → always 'intent' (all devices + SSR) — prevents manifest bloat from grid cards
 *  nav / cta → 'viewport' on touch, 'intent' on fine pointer
 *  collection → 'intent' on both
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {resolveLinkPrefetch} from '~/lib/link-prefetch';

describe('link-prefetch — nav tier', () => {
  const matchMediaMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('matchMedia', matchMediaMock);
    vi.stubGlobal('window', {matchMedia: matchMediaMock} as unknown as Window);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('nav: returns viewport on touch (coarse pointer)', () => {
    matchMediaMock.mockReturnValue({matches: false});
    expect(resolveLinkPrefetch('nav')).toBe('viewport');
  });

  it('nav: returns intent on desktop (fine pointer + hover)', () => {
    matchMediaMock.mockReturnValue({matches: true});
    expect(resolveLinkPrefetch('nav')).toBe('intent');
  });

  it('cta: returns viewport on touch', () => {
    matchMediaMock.mockReturnValue({matches: false});
    expect(resolveLinkPrefetch('cta')).toBe('viewport');
  });

  it('collection: always returns intent regardless of pointer', () => {
    matchMediaMock.mockReturnValue({matches: false});
    expect(resolveLinkPrefetch('collection')).toBe('intent');
    matchMediaMock.mockReturnValue({matches: true});
    expect(resolveLinkPrefetch('collection')).toBe('intent');
  });
});

describe('link-prefetch — product tier', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('product: returns intent on touch — no viewport manifest bloat for grid cards', () => {
    const matchMediaMock = vi.fn().mockReturnValue({matches: false});
    vi.stubGlobal('window', {matchMedia: matchMediaMock} as unknown as Window);
    expect(resolveLinkPrefetch('product')).toBe('intent');
  });

  it('product: returns intent on desktop', () => {
    const matchMediaMock = vi.fn().mockReturnValue({matches: true});
    vi.stubGlobal('window', {matchMedia: matchMediaMock} as unknown as Window);
    expect(resolveLinkPrefetch('product')).toBe('intent');
  });

  it('product: returns intent in SSR (window undefined) — consistent with client', () => {
    vi.stubGlobal('window', undefined);
    expect(resolveLinkPrefetch('product')).toBe('intent');
  });
});

describe('link-prefetch — SSR fallback', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('nav: returns viewport in SSR so first-paint includes nav prefetch hints', () => {
    vi.stubGlobal('window', undefined);
    expect(resolveLinkPrefetch('nav')).toBe('viewport');
  });

  it('cta: returns viewport in SSR', () => {
    vi.stubGlobal('window', undefined);
    expect(resolveLinkPrefetch('cta')).toBe('viewport');
  });
});
