import { AIProvider, AICompletionRequest, AICompletionResponse } from "./types";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { ALL_PROVIDERS } from "./registry";

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

export { getAllProviders } from "./registry";

/**
 * Unified AI completion function with user key/preference support.
 *
 * Tries:
 * 1. User's preferred provider (if specified and key available)
 * 2. User's other providers (if they added their own keys)
 * 3. System's available providers (Groq, OpenRouter, OpenAI via env keys)
 */
export async function aiComplete(
  request: AICompletionRequest,
  userId?: string,
): Promise<AICompletionResponse> {
  const errors: string[] = [];

  // 1. Try User's specific keys/preferences if userId provided
  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { aiKeys: true },
      });

      if (user && user.aiKeys.length > 0) {
        // Sort keys so preferred one comes first
        const sortedKeys = [...user.aiKeys].sort((a, b) => {
          if (a.provider === user.preferredAIProvider) return -1;
          if (b.provider === user.preferredAIProvider) return 1;
          return 0;
        });

        for (const userKey of sortedKeys) {
          const provider = ALL_PROVIDERS.find((p) => p.id === userKey.provider);
          if (provider) {
            try {
              console.log(
                `[AI] Trying user provider: ${provider.name} (${provider.id})`,
              );
              const decryptedKey = decrypt(userKey.key);

              // If this is the preferred provider, use preferred model if set
              const modelOverride =
                userKey.provider === user.preferredAIProvider
                  ? user.preferredAIModel || request.model
                  : request.model;

              const response = await provider.complete({
                ...request,
                apiKey: decryptedKey,
                model: modelOverride,
              });
              console.log(
                `[AI] Success (User Key): ${provider.name}, model: ${response.model}`,
              );
              return response;
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              console.warn(
                `[AI] User provider ${userKey.provider} failed: ${msg}`,
              );
              errors.push(`User ${userKey.provider}: ${msg}`);
            }
          }
        }
      }
    } catch (dbErr) {
      console.error("[AI] Error fetching user keys:", dbErr);
    }
  }

  // 2. Fallback to System Global Providers
  const systemProviders = getAvailableProviders();

  if (systemProviders.length === 0 && errors.length === 0) {
    throw new Error(
      "[AI] No AI providers available. Please configure an API key in your profile",
    );
  }

  for (const provider of systemProviders) {
    // Skip if we already tried this provider for this user via their own key (avoid duplicate tries)
    // Actually, maybe the system key works where user key failed? We'll try anyway if system key is available.
    try {
      console.log(
        `[AI] Trying system provider: ${provider.name} (${provider.id})`,
      );
      const response = await provider.complete(request);
      console.log(
        `[AI] Success (System): ${provider.name}, model: ${response.model}`,
      );
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[AI] System ${provider.name} failed: ${message}`);
      errors.push(`System ${provider.name}: ${message}`);
    }
  }

  throw new Error(
    `[AI] All providers failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
  );
}
