/**
 * Shopify Webhook Handler — Phase 6 cache invalidation (PERFORMANCE_ZERO_FLICKER_PLAN).
 *
 * Route: POST /webhooks
 * Topics handled: products/update|create|delete, collections/update|create|delete
 *
 * HMAC verification uses Web Crypto API (Workers-compatible, no Node.js crypto).
 * Secret: SHOPIFY_WEBHOOK_SECRET env var — set in Oxygen + .env.
 *
 * Cache flow (Phase 6):
 *   1. Verify HMAC signature
 *   2. Parse handle from payload
 *   3. Map topic → logical purge keys (getPurgeKeysForWebhook)
 *   4. Extract handles → purge Workers Cache entries (purgeStorefrontCache)
 *   5. Ack 200 to Shopify (purge is async via waitUntil)
 *
 * PLPs/PDPs are cleared from the Hydrogen Workers Cache instantly (< 100ms after webhook).
 * Homepage / collections-all still expire via CACHE_SHORT TTL (~1 min) — no handle variable.
 *
 * Shopify sends: X-Shopify-Topic, X-Shopify-Hmac-Sha256, X-Shopify-Shop-Domain headers.
 * Payload: JSON body with { id, handle, title, ... } for the changed resource.
 */
import type {ActionFunctionArgs} from 'react-router';
import {
  getPurgeKeysForWebhook,
  extractHandlesFromPurgeKeys,
  purgeStorefrontCache,
} from '~/lib/storefront-cache-purge';

/** Webhook topics that warrant cache action. Shopify uses slash-separated format. */
const HANDLED_TOPICS = new Set([
  'products/update',
  'products/create',
  'products/delete',
  'collections/update',
  'collections/create',
  'collections/delete',
]);

/**
 * Verify Shopify HMAC-SHA256 signature.
 * Shopify sends base64(HMAC-SHA256(secret, rawBody)) in X-Shopify-Hmac-Sha256 header.
 * Uses SubtleCrypto — available in Cloudflare Workers / Oxygen runtime.
 */
async function verifyShopifyHmac(
  secret: string,
  rawBody: string,
  hmacHeader: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      {name: 'HMAC', hash: 'SHA-256'},
      false,
      ['sign'],
    );
    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(rawBody),
    );
    /* btoa over Uint8Array bytes produces identical output to Node's
       Buffer.from(hmac).toString('base64') for ASCII-safe bodies */
    const expected = btoa(
      String.fromCharCode(...new Uint8Array(signatureBytes)),
    );
    return expected === hmacHeader;
  } catch (err) {
    console.error('[webhook] HMAC computation error', String(err));
    return false;
  }
}

/**
 * Safely parse webhook JSON body.
 * Returns empty object on parse failure — caller decides how to handle.
 */
function parseWebhookPayload(rawBody: string): Record<string, unknown> {
  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return {};
  }
}


export async function action({request, context}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json({error: 'Method not allowed'}, {status: 405});
  }

  const topic = request.headers.get('X-Shopify-Topic') ?? '';
  const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256') ?? '';
  const shopDomain = request.headers.get('X-Shopify-Shop-Domain') ?? '';

  /* Read body once — subsequent reads on a consumed stream return empty */
  const rawBody = await request.text();

  /* HMAC verification — required in production; skip only when secret not configured */
  const secret = context.env.SHOPIFY_WEBHOOK_SECRET;
  if (secret) {
    const valid = await verifyShopifyHmac(secret, rawBody, hmacHeader);
    if (!valid) {
      console.error('[webhook] HMAC verification failed — possible replay or misconfigured secret', {
        topic,
        shopDomain,
      });
      return Response.json({error: 'Unauthorized'}, {status: 401});
    }
  }

  if (!HANDLED_TOPICS.has(topic)) {
    /* Ack unknown topics so Shopify doesn't retry — we just don't act on them */
    return Response.json({received: true, topic, handled: false}, {status: 200});
  }

  const payload = parseWebhookPayload(rawBody);
  const handle = typeof payload.handle === 'string' ? payload.handle : '';
  const resourceId =
    typeof payload.id === 'number' ? payload.id : String(payload.id ?? '');

  if (!handle && !resourceId) {
    console.error('[webhook] Payload missing handle and id', {topic, shopDomain});
    /* Return 200 to prevent Shopify from retrying — payload is malformed, not transient */
    return Response.json({received: true, topic, handled: false, reason: 'no-handle'}, {status: 200});
  }

  try {
    /* Phase 6: map topic → logical keys → handles → Workers Cache purge */
    const logicalKeys = getPurgeKeysForWebhook(topic, handle);
    const handles = extractHandlesFromPurgeKeys(logicalKeys);
    console.warn('[webhook] Cache purge initiated', {topic, handle, id: resourceId, logicalKeys});
    /* waitUntil offloads async deletes past the 200 ack — avoids Shopify 5s timeout */
    await purgeStorefrontCache(handles, context.waitUntil ?? undefined);
  } catch (err) {
    /* Log purge failures but still ack so Shopify doesn't retry — purge is best-effort */
    console.error('[webhook] Cache purge failed', {topic, handle, error: String(err)});
  }

  return Response.json({received: true, topic, handle, id: resourceId}, {status: 200});
}
