/**
 * UNIT TESTS — app/lib/rate-limit.ts
 * Verifies module shape, IP extraction, and sliding-window logic via mocked Cache API.
 */
import {describe, it, expect, vi, beforeEach, beforeAll} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/* caches is a Workers/browser global — not in Node/vitest environment. Stub it here. */
const cachesStub = {
  open: vi.fn(),
};
beforeAll(() => {
  (globalThis as unknown as Record<string, unknown>).caches = cachesStub;
});

const ROOT = path.resolve(__dirname, '../..');
const src = fs.readFileSync(path.join(ROOT, 'app/lib/rate-limit.ts'), 'utf-8');

// ============================================================================
// Module shape
// ============================================================================
describe('rate-limit — module shape', () => {
  it('exports checkRateLimit function', () => {
    expect(src).toContain('export async function checkRateLimit(');
  });

  it('exports getClientIp function', () => {
    expect(src).toContain('export function getClientIp(');
  });

  it('exports RateLimitOptions interface', () => {
    expect(src).toContain('export interface RateLimitOptions');
  });

  it('exports RateLimitResult interface', () => {
    expect(src).toContain('export interface RateLimitResult');
  });

  it('uses cf-connecting-ip header for IP extraction', () => {
    expect(src).toContain("'cf-connecting-ip'");
  });

  it('falls back to x-forwarded-for', () => {
    expect(src).toContain("'x-forwarded-for'");
  });

  it('uses Workers Cache API (caches.open)', () => {
    expect(src).toContain("caches.open(");
  });

  it('has max and windowMs options', () => {
    expect(src).toContain('max: number');
    expect(src).toContain('windowMs: number');
  });

  it('returns allowed boolean and remaining count', () => {
    expect(src).toContain('allowed: boolean');
    expect(src).toContain('remaining: number');
  });

  it('returns retryAfterMs when not allowed', () => {
    expect(src).toContain('retryAfterMs');
  });

  it('fails open on cache errors (never blocks legitimate traffic)', () => {
    expect(src).toContain('Fail open');
  });
});

// ============================================================================
// getClientIp
// ============================================================================
describe('getClientIp', () => {
  it('prefers cf-connecting-ip', async () => {
    const {getClientIp} = await import('../lib/rate-limit');
    const req = new Request('https://example.com', {
      headers: {
        'cf-connecting-ip': '203.0.113.5',
        'x-forwarded-for': '10.0.0.1',
      },
    });
    expect(getClientIp(req)).toBe('203.0.113.5');
  });

  it('falls back to x-forwarded-for first IP', async () => {
    const {getClientIp} = await import('../lib/rate-limit');
    const req = new Request('https://example.com', {
      headers: {'x-forwarded-for': '10.0.0.1, 10.0.0.2'},
    });
    expect(getClientIp(req)).toBe('10.0.0.1');
  });

  it('returns "unknown" when no IP headers present', async () => {
    const {getClientIp} = await import('../lib/rate-limit');
    const req = new Request('https://example.com');
    expect(getClientIp(req)).toBe('unknown');
  });
});

// ============================================================================
// checkRateLimit — mocked Cache API
// ============================================================================
describe('checkRateLimit — sliding window', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('allows requests under the limit', async () => {
    /* Mock caches.open with empty store */
    const store = new Map<string, string>();
    const mockCache = {
      match: async (req: Request) => {
        const v = store.get(req.url);
        return v ? new Response(v) : undefined;
      },
      put: async (req: Request, res: Response) => {
        store.set(req.url, await res.text());
      },
    };
    vi.spyOn(caches, 'open').mockResolvedValue(mockCache as unknown as Cache);

    const {checkRateLimit} = await import('../lib/rate-limit');
    const result = await checkRateLimit('test:1.2.3.4', {max: 5, windowMs: 60_000});

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('blocks after exceeding max requests', async () => {
    const now = Date.now();
    /* Pre-fill 5 timestamps within the window */
    const existing = JSON.stringify([now - 4000, now - 3000, now - 2000, now - 1000, now - 500]);
    const store = new Map<string, string>();

    const mockCache = {
      match: async (req: Request) => {
        const v = store.get(req.url) ?? existing;
        return new Response(v);
      },
      put: async (req: Request, res: Response) => {
        store.set(req.url, await res.text());
      },
    };
    vi.spyOn(caches, 'open').mockResolvedValue(mockCache as unknown as Cache);

    const {checkRateLimit} = await import('../lib/rate-limit');
    const result = await checkRateLimit('test:blocked', {max: 5, windowMs: 60_000});

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('fails open when caches.open throws', async () => {
    vi.spyOn(caches, 'open').mockRejectedValue(new Error('cache unavailable'));

    const {checkRateLimit} = await import('../lib/rate-limit');
    const result = await checkRateLimit('test:failopen', {max: 5, windowMs: 60_000});

    expect(result.allowed).toBe(true);
  });

  it('expires old timestamps outside the window', async () => {
    const now = Date.now();
    /* 4 timestamps outside the 1-second window + 0 inside */
    const existing = JSON.stringify([
      now - 5000,
      now - 4000,
      now - 3000,
      now - 2000,
    ]);
    const store = new Map<string, string>();

    const mockCache = {
      match: async (req: Request) => {
        const v = store.get(req.url) ?? existing;
        return new Response(v);
      },
      put: async (req: Request, res: Response) => {
        store.set(req.url, await res.text());
      },
    };
    vi.spyOn(caches, 'open').mockResolvedValue(mockCache as unknown as Cache);

    const {checkRateLimit} = await import('../lib/rate-limit');
    /* windowMs = 1000ms → all 4 existing timestamps are outside the window */
    const result = await checkRateLimit('test:expired', {max: 3, windowMs: 1000});

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2); /* max:3 minus the 1 current request */
  });
});
