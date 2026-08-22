import { prisma } from "@/lib/prisma";
import { ALL_PROVIDERS } from "./registry";
import { AICompletionRequest, AICompletionResponse } from "./types";
import { getAvailableProviders } from "./registry";

export const FREE_QUOTA_LIMIT = 10;
const FREE_QUOTA_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

export function getFreeQuotaCount(
  freeAiGenerationsCount: number,
  lastFreeAiUsage: Date | null,
): number {
  if (!lastFreeAiUsage) return freeAiGenerationsCount;
  const elapsed = Date.now() - new Date(lastFreeAiUsage).getTime();
  return elapsed >= FREE_QUOTA_WINDOW_MS ? 0 : freeAiGenerationsCount;
}

function isModelCompatibleWithProvider(
  model: string | undefined,
  providerId: string,
): boolean {
  if (!model) return true;

  const normalized = model.toLowerCase();

  switch (providerId) {
    case "gemini":
      return normalized.startsWith("gemini-") || normalized.startsWith("gemma-");
    case "groq":
      return (
        normalized.includes("llama") ||
        normalized.includes("mixtral") ||
        normalized.includes("gemma") ||
        normalized.includes("gpt-oss")
      );
    case "openai":
      return normalized.startsWith("gpt-") || normalized.startsWith("o");
    case "claude":
      return normalized.startsWith("claude-");
    case "openrouter":
      return true;
    default:
      return true;
  }
}

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
  const isSmallFastModel = modelLower === "small-fast";
  const isLargeSmartModel = modelLower === "large-smart";

  // Логика для МАЛЕНЬКИХ и БЫСТРЫХ моделей (Llama 8B, Gemini Flash, etc.)
  if (isSmallFastModel) {
    switch (providerId) {
      case "groq":
        return "llama-3.1-8b-instant";
      case "gemini":
        return "gemini-3.5-flash-lite";
      case "openrouter":
        return "meta-llama/llama-3.1-8b-instruct";
      case "claude":
        return "claude-haiku-4-5-20251001";
      case "openai":
        return "gpt-5.6-luna";
      default:
        return requestedModel;
    }
  }

  // Логика для БОЛЬШИХ и УМНЫХ моделей (Llama 70B, Gemini Pro, Sonnet)
  if (isLargeSmartModel) {
    switch (providerId) {
      case "groq":
        return "openai/gpt-oss-120b";
      case "gemini":
        return "gemini-2.5-flash";
      case "openrouter":
        return "meta-llama/llama-3.3-70b-instruct";
      case "claude":
        return "claude-sonnet-5";
      case "openai":
        return "gpt-5.6-terra";
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
                !modelToUse &&
                userKey.provider === user.preferredAIProvider &&
                user.preferredAIModel
              ) {
                modelToUse = isModelCompatibleWithProvider(
                  user.preferredAIModel,
                  userKey.provider,
                )
                  ? user.preferredAIModel
                  : undefined;
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

              if (
                userKey.provider === user.preferredAIProvider &&
                msg.includes("Error 503")
              ) {
                throw new Error(
                  "Google Gemini is temporarily unavailable due to high demand. Please try again in 30-60 seconds.",
                );
              }

              if (
                userKey.provider === user.preferredAIProvider &&
                msg.includes("429")
              ) {
                throw new Error(
                  `${provider.name} is temporarily rate-limited for your account. Please wait a bit and try again, or switch to another provider/model.`,
                );
              }

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
      const count = getFreeQuotaCount(
        userForQuota.freeAiGenerationsCount,
        userForQuota.lastFreeAiUsage,
      );

      if (count >= FREE_QUOTA_LIMIT) {
        throw new Error(
          `You have exhausted your ${FREE_QUOTA_LIMIT} free AI generations for this week. Please connect your own API key in settings.`,
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
        const count = getFreeQuotaCount(
          userForQuota.freeAiGenerationsCount,
          userForQuota.lastFreeAiUsage,
        );

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

  console.error(
    `[AI] All providers failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
  );

  const isRateLimited = errors.some(
    (e) => e.includes("429") || e.toLowerCase().includes("rate_limit"),
  );

  throw new Error(
    isRateLimited
      ? "AI service is temporarily busy. Please try again in a minute."
      : "AI service is temporarily unavailable. Please try again shortly.",
  );
}
