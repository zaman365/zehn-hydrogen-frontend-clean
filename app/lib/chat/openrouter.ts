import type {
  OpenRouterMessage,
  OpenRouterRequest,
  OpenRouterResponse,
} from './types';

// ============================================
// CONSTANTS
// ============================================

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek/deepseek-chat';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 800;

// ============================================
// OPENROUTER API CLIENT
// ============================================

/**
 * Call the OpenRouter API with DeepSeek free model.
 * Uses standard fetch() — compatible with Cloudflare Workers runtime.
 */
export async function callOpenRouter({
  apiKey,
  messages,
  temperature = DEFAULT_TEMPERATURE,
  maxTokens = DEFAULT_MAX_TOKENS,
}: {
  apiKey: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const requestBody: OpenRouterRequest = {
    model: DEEPSEEK_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://zehn.store',
      'X-Title': 'ZEHN Kundenservice',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(
      `OpenRouter API error (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as OpenRouterResponse;

  // Check for API-level errors
  if (data.error) {
    throw new Error(
      `OpenRouter error: ${data.error.message || 'Unknown API error'}`
    );
  }

  // Extract the assistant's response
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenRouter returned empty response');
  }

  return content;
}
