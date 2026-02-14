import { AIProvider, AICompletionRequest, AICompletionResponse } from "./types";
import { GroqProvider, OpenRouterProvider, OpenAIProvider } from "./providers";

/**
 * All registered AI providers.
 * To add a new provider, just create a class implementing AIProvider
 * and add it to this array.
 */
const ALL_PROVIDERS: AIProvider[] = [
  new OpenRouterProvider(),
  new GroqProvider(),
  new OpenAIProvider(),
];

/**
 * Default provider priority order.
 * Can be overridden via AI_PROVIDER_ORDER env variable (comma-separated IDs).
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
 * Get providers ordered by priority, filtered to only available ones.
 */
export function getAvailableProviders(): AIProvider[] {
  const order = getProviderOrder();
  const providerMap = new Map(ALL_PROVIDERS.map((p) => [p.id, p]));

  return order
    .map((id) => providerMap.get(id))
    .filter((p): p is AIProvider => p !== undefined && p.isAvailable());
}

/**
 * Get the list of all registered providers (available or not).
 */
export function getAllProviders(): AIProvider[] {
  return [...ALL_PROVIDERS];
}

/**
 * Unified AI completion function.
 *
 * Tries each available provider in priority order until one succeeds.
 * Routes/services should ONLY use this function — no direct LLM calls.
 *
 * @example
 * ```ts
 * import { aiComplete } from "@/lib/ai";
 *
 * const response = await aiComplete({
 *   systemPrompt: "You are a helpful assistant.",
 *   userPrompt: "Hello!",
 *   temperature: 0.7,
 * });
 * console.log(response.content); // AI response
 * console.log(response.provider); // "openrouter" | "groq" | "openai"
 * ```
 */
export async function aiComplete(
  request: AICompletionRequest,
): Promise<AICompletionResponse> {
  const providers = getAvailableProviders();

  if (providers.length === 0) {
    throw new Error(
      "[AI] No AI providers available. Configure at least one API key: " +
        "OPENROUTER_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY",
    );
  }

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      console.log(`[AI] Trying provider: ${provider.name} (${provider.id})`);
      const response = await provider.complete(request);
      console.log(`[AI] Success: ${provider.name}, model: ${response.model}`);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[AI] ${provider.name} failed: ${message}`);
      errors.push(`${provider.name}: ${message}`);
    }
  }

  throw new Error(
    `[AI] All providers failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
  );
}
