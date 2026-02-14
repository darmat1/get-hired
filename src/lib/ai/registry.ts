import { AIProvider } from "./types";
import {
  GroqProvider,
  OpenRouterProvider,
  OpenAIProvider,
  ClaudeProvider,
  GeminiProvider,
  GrokProvider,
} from "./providers";

/**
 * All registered AI providers.
 * This file is client-safe as it doesn't import server-only logic like Prisma or Crypto.
 */
export const ALL_PROVIDERS: AIProvider[] = [
  new OpenRouterProvider(),
  new GroqProvider(),
  new OpenAIProvider(),
  new ClaudeProvider(),
  new GeminiProvider(),
  new GrokProvider(),
];

/**
 * Get all registered providers.
 */
export function getAllProviders(): AIProvider[] {
  return [...ALL_PROVIDERS];
}
