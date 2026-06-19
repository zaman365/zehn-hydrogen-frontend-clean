// ============================================
// SHARED CHAT TYPES
// ============================================

/** A single message in the chat conversation */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/** Request body sent from frontend to /api/chat */
export interface ChatRequest {
  messages: ChatMessage[];
}

/** Response body returned from /api/chat */
export interface ChatResponse {
  content: string;
  error?: string;
}

// ============================================
// OPENROUTER API TYPES
// ============================================

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface OpenRouterChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: OpenRouterChoice[];
  error?: {
    message: string;
    code?: number;
  };
}
