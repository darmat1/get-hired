/**
 * AI Provider Abstraction Types
 *
 * Shared types for all AI provider adapters and the unified client.
 */

export interface AICompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" } | { type: "text" };
}

export interface AICompletionResponse {
  content: string;
  provider: string;
  model: string;
}

export interface AIProvider {
  /** Unique identifier, e.g. "groq", "openrouter", "openai" */
  id: string;
  /** Human-readable name */
  name: string;
  /** Whether this provider is configured (has API key) */
  isAvailable(): boolean;
  /** Send a completion request */
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
}
