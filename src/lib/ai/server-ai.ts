import { prisma } from "@/lib/prisma";
import { ALL_PROVIDERS } from "./registry";
import { AICompletionRequest, AICompletionResponse } from "./types";
import { getAvailableProviders } from "./registry";

/**
 * Unified AI completion function with user key/preference support.
 *
 * SERVER-ONLY: Imports Prisma and handles database lookups for user keys.
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
          const preferredProvider = user.preferredAIProvider || undefined;
          if (a.provider === preferredProvider) return -1;
          if (b.provider === preferredProvider) return 1;
          return 0;
        });

        for (const userKey of sortedKeys) {
          const provider = ALL_PROVIDERS.find((p) => p.id === userKey.provider);
          if (provider) {
            try {
              console.log(
                `[AI] Trying user provider: ${provider.name} (${provider.id})`,
              );
              const decryptedKey = userKey.key ?? undefined;

              // ONLY use preferred model if it belongs to the CURRENT provider being tried
              let modelOverride = request.model;
              if (userKey.provider === user.preferredAIProvider && user.preferredAIModel) {
                // Additional safety check: only use the model if it's likely meant for this provider
                const isGeminiModel = user.preferredAIModel.startsWith('gemini-');
                const isGroqModel = user.preferredAIModel.includes('llama') || user.preferredAIModel.includes('mixtral') || user.preferredAIModel.includes('gemma');
                
                if (userKey.provider === 'gemini' && isGeminiModel) {
                  modelOverride = user.preferredAIModel;
                } else if (userKey.provider === 'groq' && isGroqModel) {
                  modelOverride = user.preferredAIModel;
                } else if (userKey.provider === 'openrouter' || userKey.provider === 'openai' || userKey.provider === 'claude') {
                  // These are usually fine with their own models
                  modelOverride = user.preferredAIModel;
                }
                // If it's Groq but model is Gemini, modelOverride remains request.model (default)
              }

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
