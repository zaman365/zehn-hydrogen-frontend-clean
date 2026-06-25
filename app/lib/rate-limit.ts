/**
 * In-process sliding-window rate limiter using the Workers Cache API.
 *
 * Stores a JSON array of request timestamps per key in a dedicated 'rate-limit' cache.
 * No Redis/Upstash required — Workers Cache API is sufficient for abuse prevention at
 * ZEHN's expected traffic volume (documented decision in DECISION_LOG).
 *
 * Key format: `{route}:{ip}` — e.g. `contact:203.0.113.5`
 * Window: configurable per route (see RateLimitOptions).
 *
 * Fail-open: if cache is unavailable (dev/test), returns allowed=true.
 * All operations are wrapped in try/catch — rate limiting must never block legitimate traffic.
 */

const RATE_LIMIT_CACHE = 'rate-limit';

/** URL namespace for rate-limit cache entries — must be a valid URL. */
const RATE_LIMIT_URL = 'https://zehn.rate-limit/';

export interface RateLimitOptions {
  /** Max requests allowed within windowMs. */
  max: number;
  /** Sliding window size in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Milliseconds until the oldest request expires and a new slot opens. Present when allowed=false. */
  retryAfterMs?: number;
  /** Remaining slots in the current window. */
  remaining: number;
}

/**
 * Extract the real client IP from Cloudflare/proxy headers.
 * Prefers cf-connecting-ip (set by Cloudflare) over x-forwarded-for.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

/**
 * Check and record a rate limit hit for the given key.
 *
 * @param key     - Composite key, e.g. `contact:${ip}`
 * @param opts    - max and windowMs options
 * @returns RateLimitResult — check `allowed` before processing the request
 */
export async function checkRateLimit(
  key: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const {max, windowMs} = opts;
  const now = Date.now();

  try {
    const cache = await caches.open(RATE_LIMIT_CACHE);
    const url = `${RATE_LIMIT_URL}${encodeURIComponent(key)}`;
    const req = new Request(url);

    /* Load existing timestamps for this key */
    let timestamps: number[] = [];
    const stored = await cache.match(req);
    if (stored) {
      try {
        const text = await stored.text();
        const parsed = JSON.parse(text) as unknown;
        if (Array.isArray(parsed)) timestamps = parsed as number[];
      } catch {
        /* Corrupt entry — start fresh */
      }
    }

    /* Slide the window — discard timestamps older than windowMs */
    const windowStart = now - windowMs;
    const recent = timestamps.filter((t) => t >= windowStart);

    if (recent.length >= max) {
      /* Oldest timestamp in window determines when next slot opens */
      const oldest = recent[0];
      const retryAfterMs = oldest + windowMs - now;
      return {allowed: false, retryAfterMs: Math.max(0, retryAfterMs), remaining: 0};
    }

    /* Record current request timestamp */
    recent.push(now);
    const ttlSeconds = Math.ceil(windowMs / 1000);
    const response = new Response(JSON.stringify(recent), {
      headers: {'Cache-Control': `public, max-age=${ttlSeconds}`},
    });
    await cache.put(req, response);

    return {allowed: true, remaining: max - recent.length};
  } catch {
    /* Fail open — never block legitimate traffic on cache errors */
    return {allowed: true, remaining: max};
  }
}
