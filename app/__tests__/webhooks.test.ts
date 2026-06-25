/**
 * UNIT TESTS — Phase 5 Shopify webhook handler (app/routes/webhooks.tsx).
 * Verifies handler shape, HMAC helper, topic routing, and response contracts.
 * Uses source-string checks (consistent with storefront-cache-policy.test.ts)
 * plus vitest mocks for the Web Crypto / action function path.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf-8');
}

const src = read('app/routes/webhooks.tsx');

// ============================================================================
// Module shape — source string checks
// ============================================================================
describe('webhooks route — module shape', () => {
  it('exports action function', () => {
    expect(src).toContain('export async function action(');
  });

  it('imports ActionFunctionArgs from react-router (not remix)', () => {
    expect(src).toContain("from 'react-router'");
    expect(src).not.toContain('@remix-run');
    expect(src).not.toContain('react-router-dom');
  });

  it('handles PRODUCTS_UPDATE topic', () => {
    expect(src).toContain("'products/update'");
  });

  it('handles COLLECTIONS_UPDATE topic', () => {
    expect(src).toContain("'collections/update'");
  });

  it('handles create and delete variants', () => {
    expect(src).toContain("'products/create'");
    expect(src).toContain("'products/delete'");
    expect(src).toContain("'collections/create'");
    expect(src).toContain("'collections/delete'");
  });

  it('reads SHOPIFY_WEBHOOK_SECRET from context.env', () => {
    expect(src).toContain('context.env.SHOPIFY_WEBHOOK_SECRET');
  });

  it('uses Web Crypto HMAC-SHA256 (not Node crypto)', () => {
    expect(src).toContain('crypto.subtle.importKey');
    expect(src).toContain("'HMAC'");
    expect(src).toContain("'SHA-256'");
    expect(src).not.toContain("require('crypto')");
    expect(src).not.toContain("from 'crypto'");
  });

  it('reads X-Shopify-Topic header', () => {
    expect(src).toContain("'X-Shopify-Topic'");
  });

  it('reads X-Shopify-Hmac-Sha256 header', () => {
    expect(src).toContain("'X-Shopify-Hmac-Sha256'");
  });

  it('reads X-Shopify-Shop-Domain header', () => {
    expect(src).toContain("'X-Shopify-Shop-Domain'");
  });

  it('returns 405 for non-POST methods', () => {
    expect(src).toContain("status: 405");
    expect(src).toContain("'Method not allowed'");
  });

  it('returns 401 when HMAC verification fails', () => {
    expect(src).toContain("status: 401");
    expect(src).toContain("'Unauthorized'");
  });

  it('returns 200 for unknown topics (ack without processing)', () => {
    expect(src).toContain('handled: false');
  });

  it('imports purge helpers from storefront-cache-purge lib', () => {
    expect(src).toContain("from '~/lib/storefront-cache-purge'");
    expect(src).toContain('getPurgeKeysForWebhook');
    expect(src).toContain('purgeStorefrontCache');
  });

  it('logs cache purge initiation', () => {
    expect(src).toContain("'[webhook] Cache purge initiated'");
  });

  it('logs purge failures via console.error', () => {
    expect(src).toContain("console.error('[webhook] Cache purge failed'");
  });

  it('passes context.waitUntil for async purge', () => {
    expect(src).toContain('context.waitUntil');
    expect(src).toContain('purgeStorefrontCache');
  });

  it('returns 200 on successful webhook ack', () => {
    expect(src).toContain('received: true');
    expect(src).toContain('status: 200');
  });

  it('acks malformed payload without Shopify retry (returns 200)', () => {
    expect(src).toContain("reason: 'no-handle'");
  });
});

// ============================================================================
// HMAC helper — unit tests via Web Crypto mock
// ============================================================================
describe('verifyShopifyHmac — crypto behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when crypto.subtle.importKey throws', async () => {
    const cryptoSpy = vi.spyOn(crypto.subtle, 'importKey').mockRejectedValueOnce(
      new Error('mock error'),
    );
    /* Import the module fresh to call the unexported helper indirectly via action */
    const mod = await import('../routes/webhooks');
    const mockRequest = new Request('https://example.com/webhooks', {
      method: 'POST',
      headers: {
        'X-Shopify-Topic': 'products/update',
        'X-Shopify-Hmac-Sha256': 'bad-hmac',
        'X-Shopify-Shop-Domain': 'test.myshopify.com',
      },
      body: JSON.stringify({id: 1, handle: 'test-product'}),
    });
    const mockContext = {env: {SHOPIFY_WEBHOOK_SECRET: 'test-secret'}} as unknown as Parameters<typeof mod.action>[0]['context'];
    const response =  
    await mod.action({request: mockRequest, context: mockContext, params: {}} as any);
    expect(response.status).toBe(401);
    cryptoSpy.mockRestore();
  });
});

// ============================================================================
// Action — response contract tests
// ============================================================================
describe('webhooks action — response contracts', () => {
  it('returns 405 for GET request', async () => {
    const mod = await import('../routes/webhooks');
    const request = new Request('https://example.com/webhooks', {method: 'GET'});
    const context = {env: {}} as unknown as Parameters<typeof mod.action>[0]['context'];
    const response =  
    await mod.action({request, context, params: {}} as any);
    expect(response.status).toBe(405);
  });

  it('returns 200 and handled:false for unregistered topic', async () => {
    const mod = await import('../routes/webhooks');
    const request = new Request('https://example.com/webhooks', {
      method: 'POST',
      headers: {'X-Shopify-Topic': 'orders/create'},
      body: '{}',
    });
    const context = {env: {}} as unknown as Parameters<typeof mod.action>[0]['context'];
    const response =  
    await mod.action({request, context, params: {}} as any);
    expect(response.status).toBe(200);
    const json = await response.json() as {handled: boolean};
    expect(json.handled).toBe(false);
  });

  it('returns 200 for products/update without secret configured', async () => {
    const mod = await import('../routes/webhooks');
    const payload = {id: 12345, handle: 'cool-product', title: 'Cool Product'};
    const request = new Request('https://example.com/webhooks', {
      method: 'POST',
      headers: {
        'X-Shopify-Topic': 'products/update',
        'X-Shopify-Shop-Domain': 'zehn.myshopify.com',
      },
      body: JSON.stringify(payload),
    });
    /* No SHOPIFY_WEBHOOK_SECRET — HMAC check skipped */
    const context = {env: {}} as unknown as Parameters<typeof mod.action>[0]['context'];
    const response =  
    await mod.action({request, context, params: {}} as any);
    expect(response.status).toBe(200);
    const json = await response.json() as {received: boolean; topic: string; handle: string};
    expect(json.received).toBe(true);
    expect(json.topic).toBe('products/update');
    expect(json.handle).toBe('cool-product');
  });

  it('returns 200 for collections/delete without secret configured', async () => {
    const mod = await import('../routes/webhooks');
    const payload = {id: 99, handle: 'sale', title: 'Sale'};
    const request = new Request('https://example.com/webhooks', {
      method: 'POST',
      headers: {'X-Shopify-Topic': 'collections/delete'},
      body: JSON.stringify(payload),
    });
    const context = {env: {}} as unknown as Parameters<typeof mod.action>[0]['context'];
    const response =  
    await mod.action({request, context, params: {}} as any);
    expect(response.status).toBe(200);
    const json = await response.json() as {topic: string};
    expect(json.topic).toBe('collections/delete');
  });
});

// ============================================================================
// Phase 6 — purge integration checks on webhooks.tsx source
// ============================================================================
describe('webhooks route — Phase 6 purge integration', () => {
  it('calls getPurgeKeysForWebhook with topic and handle', () => {
    expect(src).toContain('getPurgeKeysForWebhook(topic, handle)');
  });

  it('calls extractHandlesFromPurgeKeys on logical keys', () => {
    expect(src).toContain('extractHandlesFromPurgeKeys(');
  });

  it('calls purgeStorefrontCache with handles and waitUntil', () => {
    expect(src).toContain('purgeStorefrontCache(handles,');
  });

  it('still returns 200 on purge failure (Shopify never retries)', () => {
    /* catch block should not rethrow */
    expect(src).toContain("console.error('[webhook] Cache purge failed'");
    /* Action still reaches the 200 return after the catch */
    expect(src).toContain('received: true');
  });
});

// ============================================================================
// storefront-cache-policy.ts — Phase 5 documentation update
// ============================================================================
describe('storefront-cache-policy — Phase 5 webhook documentation', () => {
  const policySrc = read('app/lib/storefront-cache-policy.ts');

  it('documents PRODUCTS_UPDATE webhook topic', () => {
    expect(policySrc).toContain('PRODUCTS_UPDATE');
  });

  it('documents COLLECTIONS_UPDATE webhook topic', () => {
    expect(policySrc).toContain('COLLECTIONS_UPDATE');
  });

  it('references app/routes/webhooks.tsx', () => {
    expect(policySrc).toContain('app/routes/webhooks.tsx');
  });

  it('notes Phase 6 Oxygen surrogate-key purge', () => {
    expect(policySrc).toContain('Phase 6');
    expect(policySrc).toContain('surrogate-key');
  });
});
