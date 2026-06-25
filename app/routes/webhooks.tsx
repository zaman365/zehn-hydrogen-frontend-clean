/**
 * Shopify Webhook Handler — Phase 5 cache invalidation (PERFORMANCE_ZERO_FLICKER_PLAN).
 *
 * Route: POST /webhooks
 * Topics handled: products/update|create|delete, collections/update|create|delete
 *
 * HMAC verification uses Web Crypto API (Workers-compatible, no Node.js crypto).
 * Secret: SHOPIFY_WEBHOOK_SECRET env var — set in Oxygen + .env.
 *
 * Cache note: PLPs/PDPs use CACHE_SHORT (~1 min). Webhook ack shortens the
 * staleness window. Phase 6 will add Oxygen surrogate-key purge for instant invalidation.
 *
 * Shopify sends: X-Shopify-Topic, X-Shopify-Hmac-Sha256, X-Shopify-Shop-Domain headers.
 * Payload: JSON body with { id, handle, title, ... } for the changed resource.
 */
import type {ActionFunctionArgs} from 'react-router';

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

/**
 * Log a structured cache-purge event.
 * Phase 6: replace with Oxygen surrogate-key purge API call.
 */
function logCachePurge(
  topic: string,
  handle: string,
  resourceId: number | string,
): void {
  if (topic.startsWith('products/')) {
    console.log('[webhook] Product cache purge', {topic, handle, id: resourceId});
    /* Phase 6: await oxygenCache.purgeByTag(`product-${handle}`); */
  } else if (topic.startsWith('collections/')) {
    console.log('[webhook] Collection cache purge', {topic, handle, id: resourceId});
    /* Phase 6: await oxygenCache.purgeByTag(`collection-${handle}`); */
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
    logCachePurge(topic, handle, resourceId);
  } catch (err) {
    /* Log purge failures but still ack so Shopify doesn't retry — purge is best-effort */
    console.error('[webhook] Cache purge failed', {topic, handle, error: String(err)});
  }

  return Response.json({received: true, topic, handle, id: resourceId}, {status: 200});
}
