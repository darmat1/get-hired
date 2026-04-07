import { prisma } from "@/lib/prisma";
import { ALL_PROVIDERS } from "./registry";
import { AICompletionRequest, AICompletionResponse } from "./types";
import { getAvailableProviders } from "./registry";

/**
 * Вспомогательная функция для маппинга универсальных имен моделей
 * под специфичные требования каждого API провайдера.
 */
function mapModelForProvider(
  requestedModel: string | undefined,
  providerId: string,
): string | undefined {
  if (!requestedModel) return undefined;

  const modelLower = requestedModel.toLowerCase();

  // Логика для МАЛЕНЬКИХ и БЫСТРЫХ моделей (Llama 8B, Gemini Flash, etc.)
  if (
    modelLower.includes("8b") ||
    modelLower.includes("instant") ||
    modelLower.includes("flash") ||
    modelLower.includes("small")
  ) {
    switch (providerId) {
      case "groq":
        return "llama-3.1-8b-instant";
      case "gemini":
        return "gemini-embedding-001";
      case "openrouter":
        return "meta-llama/llama-3.1-8b-instruct";
      case "claude":
        return "claude-3-haiku-20240307";
      case "openai":
        return "gpt-4o-mini";
      default:
        return requestedModel;
    }
  }

  // Логика для БОЛЬШИХ и УМНЫХ моделей (Llama 70B, Gemini Pro, Sonnet)
  if (
    modelLower.includes("70b") ||
    modelLower.includes("versatile") ||
    modelLower.includes("pro") ||
    modelLower.includes("large") ||
    modelLower.includes("3.3")
  ) {
    switch (providerId) {
      case "groq":
        return "llama-3.3-70b-versatile";
      case "gemini":
        return "gemini-1.5-pro";
      case "openrouter":
        return "meta-llama/llama-3.3-70b-instruct";
      case "claude":
        return "claude-3-5-sonnet-latest";
      case "openai":
        return "gpt-4o";
      default:
        return requestedModel;
    }
  }

  return requestedModel;
}

/**
 * Unified AI completion function with user key/preference support.
 *
 * SERVER-ONLY: Handles database lookups, quota management and provider failover.
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

              // Apply model mapping for the user provider
              let modelToUse = request.model;
              if (
                userKey.provider === user.preferredAIProvider &&
                user.preferredAIModel
              ) {
                modelToUse = user.preferredAIModel;
              }

              const finalModel = mapModelForProvider(modelToUse, provider.id);

              const response = await provider.complete({
                ...request,
                apiKey: decryptedKey,
                model: finalModel,
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
      "[AI] No AI providers available. Please configure API keys.",
    );
  }

  // 2.1 Enforce Free Quota
  let userForQuota: {
    freeAiGenerationsCount: number;
    lastFreeAiUsage: Date | null;
  } | null = null;

  if (userId) {
    userForQuota = await prisma.user.findUnique({
      where: { id: userId },
      select: { freeAiGenerationsCount: true, lastFreeAiUsage: true },
    });

    if (userForQuota) {
      let count = userForQuota.freeAiGenerationsCount;
      const today = new Date();

      if (userForQuota.lastFreeAiUsage) {
        const lastUsageDate = new Date(userForQuota.lastFreeAiUsage);
        if (
          lastUsageDate.getUTCFullYear() !== today.getUTCFullYear() ||
          lastUsageDate.getUTCMonth() !== today.getUTCMonth() ||
          lastUsageDate.getUTCDate() !== today.getUTCDate()
        ) {
          count = 0;
        }
      }

      if (count >= 10) {
        throw new Error(
          "You have exhausted your 10 free AI generations for today. Please connect your own API key in settings.",
        );
      }
    }
  }

  // 2.2 Try System Providers one by one
  for (const provider of systemProviders) {
    try {
      console.log(
        `[AI] Trying system provider: ${provider.name} (${provider.id})`,
      );

      // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Маппинг модели под системного провайдера
      const finalModel = mapModelForProvider(request.model, provider.id);

      const response = await provider.complete({
        ...request,
        model: finalModel,
      });

      // 2.3 Increment Quota on Success
      if (userId && userForQuota) {
        let count = userForQuota.freeAiGenerationsCount;
        const today = new Date();

        if (userForQuota.lastFreeAiUsage) {
          const lastUsageDate = new Date(userForQuota.lastFreeAiUsage);
          if (
            lastUsageDate.getUTCFullYear() !== today.getUTCFullYear() ||
            lastUsageDate.getUTCMonth() !== today.getUTCMonth() ||
            lastUsageDate.getUTCDate() !== today.getUTCDate()
          ) {
            count = 0;
          }
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            freeAiGenerationsCount: count + 1,
            lastFreeAiUsage: new Date(),
          },
        });
      }

      console.log(
        `[AI] Success (System): ${provider.name}, model: ${response.model}`,
      );
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[AI] System ${provider.name} failed: ${message}`);
      errors.push(`System ${provider.name}: ${message}`);

      // Если это ошибка Rate Limit (429), цикл автоматически перейдет к следующему провайдеру
    }
  }

  throw new Error(
    `[AI] All providers failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
  );
}
