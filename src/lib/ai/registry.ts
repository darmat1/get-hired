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
 * Default provider priority order.
 */
function getProviderOrder(): string[] {
  const envOrder = process.env.AI_PROVIDER_ORDER;
  if (envOrder) {
    return envOrder
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }
  return ALL_PROVIDERS.map((p) => p.id);
}

/**
 * Get providers ordered by priority.
 */
export function getAvailableProviders(): AIProvider[] {
  const order = getProviderOrder();
  const providerMap = new Map(ALL_PROVIDERS.map((p) => [p.id, p]));

  return order
    .map((id) => providerMap.get(id))
    .filter((p): p is AIProvider => p !== undefined && p.isAvailable());
}

/**
 * Get all registered providers.
 */
export function getAllProviders(): AIProvider[] {
  return [...ALL_PROVIDERS];
}
