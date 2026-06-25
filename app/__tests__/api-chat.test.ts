/**
 * UNIT TESTS — app/routes/api.chat.tsx
 * Verifies module shape, rate-limit wiring, and response contracts.
 * Workers Cache API is stubbed globally (same pattern as rate-limit.test.ts).
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
const src = fs.readFileSync(path.join(ROOT, 'app/routes/api.chat.tsx'), 'utf-8');

// ============================================================================
// Module shape
// ============================================================================
describe('api.chat — module shape', () => {
  it('exports action function', () => {
    expect(src).toContain('export async function action(');
  });

  it('imports ActionFunctionArgs from react-router (not remix)', () => {
    expect(src).toContain("from 'react-router'");
    expect(src).not.toContain('@remix-run');
    expect(src).not.toContain('react-router-dom');
  });

  it('imports checkRateLimit and getClientIp from rate-limit lib', () => {
    expect(src).toContain("from '~/lib/rate-limit'");
    expect(src).toContain('checkRateLimit');
    expect(src).toContain('getClientIp');
  });

  it('imports callOpenRouter from chat/openrouter lib', () => {
    expect(src).toContain("from '~/lib/chat/openrouter'");
    expect(src).toContain('callOpenRouter');
  });

  it('imports buildSystemPrompt and fetchProductContext from chat libs', () => {
    expect(src).toContain("from '~/lib/chat/system-prompt'");
    expect(src).toContain("from '~/lib/chat/product-context'");
    expect(src).toContain('buildSystemPrompt');
    expect(src).toContain('fetchProductContext');
  });

  it('reads OPENROUTER_API_KEY from context.env', () => {
    expect(src).toContain('context.env.OPENROUTER_API_KEY');
  });

  it('rate-limits at 20 req / 60s per IP', () => {
    expect(src).toContain('max: 20');
    expect(src).toContain('60_000');
    expect(src).toContain('`chat:${ip}`');
  });

  it('returns 405 for non-POST methods', () => {
    expect(src).toContain("status: 405");
    expect(src).toContain('Method not allowed');
  });

  it('returns 429 when rate limited with Retry-After header', () => {
    expect(src).toContain("status: 429");
    expect(src).toContain("'Retry-After'");
    expect(src).toContain('Zu viele Anfragen');
  });

  it('returns 400 when messages array is empty', () => {
    expect(src).toContain("status: 400");
    expect(src).toContain('Keine Nachrichten angegeben');
  });

  it('returns 500 when OPENROUTER_API_KEY is not set', () => {
    expect(src).toContain('KI-Service nicht konfiguriert');
  });

  it('prepends system message to OpenRouter conversation', () => {
    expect(src).toContain("role: 'system'");
    expect(src).toContain('systemPrompt');
  });

  it('catches errors and returns 500 without throwing', () => {
    expect(src).toContain("console.error('[api.chat] Error:'");
    expect(src).toContain('Anfrage fehlgeschlagen');
  });
});

// ============================================================================
// Response contracts
// ============================================================================
describe('api.chat action — response contracts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    /* Default: allow all rate limit checks */
    const mockCache = {
      match: async () => undefined,
      put: async () => {},
    };
    vi.spyOn(caches, 'open').mockResolvedValue(mockCache as unknown as Cache);
  });

  it('returns 405 for GET request', async () => {
    const mod = await import('../routes/api.chat');
    const request = new Request('https://example.com/api/chat', {method: 'GET'});
    const context = {env: {}, storefront: {query: async () => ({products: {nodes: []}})}} as unknown as Parameters<typeof mod.action>[0]['context'];
    const response = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await mod.action({request, context, params: {}} as any);
    expect(response.status).toBe(405);
    const json = await response.json() as {content: string; error?: string};
    expect(json.content).toBe('');
    expect(json.error).toBeTruthy();
  });

  it('returns 400 for empty messages array', async () => {
    const mod = await import('../routes/api.chat');
    const request = new Request('https://example.com/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({messages: []}),
    });
    const context = {env: {OPENROUTER_API_KEY: 'test-key'}, storefront: {query: async () => ({products: {nodes: []}})}} as unknown as Parameters<typeof mod.action>[0]['context'];
    const response = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await mod.action({request, context, params: {}} as any);
    expect(response.status).toBe(400);
  });

  it('returns 500 when OPENROUTER_API_KEY is not configured', async () => {
    const mod = await import('../routes/api.chat');
    const request = new Request('https://example.com/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({messages: [{role: 'user', content: 'Hallo'}]}),
    });
    /* No API key in env */
    const context = {env: {}, storefront: {query: async () => ({products: {nodes: []}})}} as unknown as Parameters<typeof mod.action>[0]['context'];
    const response = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await mod.action({request, context, params: {}} as any);
    expect(response.status).toBe(500);
    const json = await response.json() as {content: string; error?: string};
    expect(json.content).toBe('');
    expect(json.error).toContain('nicht konfiguriert');
  });

  it('returns 200 with AI response when OpenRouter succeeds', async () => {
    /* Mock fetch for OpenRouter API */
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{message: {role: 'assistant', content: 'Gerne helfe ich Ihnen!'}, finish_reason: 'stop'}],
        }),
        {status: 200},
      ),
    );
    vi.stubGlobal('fetch', mockFetch);

    const mod = await import('../routes/api.chat');
    const request = new Request('https://example.com/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({messages: [{role: 'user', content: 'Hallo'}]}),
    });
    const context = {
      env: {OPENROUTER_API_KEY: 'test-key'},
      storefront: {query: async () => ({products: {nodes: []}})},
    } as unknown as Parameters<typeof mod.action>[0]['context'];
    const response = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await mod.action({request, context, params: {}} as any);
    expect(response.status).toBe(200);
    const json = await response.json() as {content: string};
    expect(json.content).toBe('Gerne helfe ich Ihnen!');

    vi.unstubAllGlobals();
  });

  it('returns 500 when OpenRouter fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

    const mod = await import('../routes/api.chat');
    const request = new Request('https://example.com/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({messages: [{role: 'user', content: 'Hallo'}]}),
    });
    const context = {
      env: {OPENROUTER_API_KEY: 'test-key'},
      storefront: {query: async () => ({products: {nodes: []}})},
    } as unknown as Parameters<typeof mod.action>[0]['context'];
    const response = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await mod.action({request, context, params: {}} as any);
    expect(response.status).toBe(500);

    vi.unstubAllGlobals();
  });
});
