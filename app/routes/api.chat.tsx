import type {ActionFunctionArgs} from 'react-router';
import {checkRateLimit, getClientIp} from '~/lib/rate-limit';
import {callOpenRouter} from '~/lib/chat/openrouter';
import {buildSystemPrompt} from '~/lib/chat/system-prompt';
import {fetchProductContext} from '~/lib/chat/product-context';
import type {ChatResponse, OpenRouterMessage} from '~/lib/chat/types';

/**
 * AI chat API route — POST /api/chat
 *
 * Proxies the ZEHN assistant conversation to OpenRouter (DeepSeek model).
 * Builds a ZEHN-specific system prompt with live product catalog (static fallback on error).
 *
 * Rate limit: 20 requests / 60 s per IP (Workers Cache sliding window — fail-open).
 * Env: OPENROUTER_API_KEY (Oxygen env + .env).
 *
 * Request  — { messages: Array<{role: 'user'|'assistant', content: string}> }
 * Response — { content: string, error?: string }
 */
export async function action({request, context}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json(
      {content: '', error: 'Method not allowed'} satisfies ChatResponse,
      {status: 405},
    );
  }

  /* Rate limit: 20 req / 60 s per IP — protects OpenRouter free-tier quota */
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`chat:${ip}`, {
    max: 20,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    const retryAfterSec = Math.ceil((rateLimit.retryAfterMs ?? 0) / 1000);
    return Response.json(
      {
        content: '',
        error: `Zu viele Anfragen. Bitte warten Sie ${retryAfterSec} Sekunden.`,
      } satisfies ChatResponse,
      {
        status: 429,
        headers: {'Retry-After': String(retryAfterSec)},
      },
    );
  }

  try {
    const body = (await request.json()) as {messages?: unknown};
    const messages = body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        {content: '', error: 'Keine Nachrichten angegeben.'} satisfies ChatResponse,
        {status: 400},
      );
    }

    /* OpenRouter API key — required in production, set in Oxygen env */
    const apiKey = context.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('[api.chat] OPENROUTER_API_KEY is not configured');
      return Response.json(
        {content: '', error: 'KI-Service nicht konfiguriert.'} satisfies ChatResponse,
        {status: 500},
      );
    }

    /* Fetch live product catalog for system prompt; static fallback on error */
    const productContext = await fetchProductContext(
      context.storefront as Parameters<typeof fetchProductContext>[0],
    );
    const systemPrompt = buildSystemPrompt(productContext);

    /* Prepend ZEHN system message; cast roles — ChatMessage roles match OpenRouterMessage */
    const openRouterMessages: OpenRouterMessage[] = [
      {role: 'system', content: systemPrompt},
      ...(messages as Array<{role: string; content: string}>).map((m) => ({
        role: m.role as OpenRouterMessage['role'],
        content: String(m.content),
      })),
    ];

    const content = await callOpenRouter({apiKey, messages: openRouterMessages});
    return Response.json({content} satisfies ChatResponse);
  } catch (error) {
    console.error('[api.chat] Error:', error);
    return Response.json(
      {content: '', error: 'Anfrage fehlgeschlagen. Bitte erneut versuchen.'} satisfies ChatResponse,
      {status: 500},
    );
  }
}
