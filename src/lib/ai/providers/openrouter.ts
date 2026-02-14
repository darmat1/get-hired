import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from "../types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export class OpenRouterProvider implements AIProvider {
  id = "openrouter";
  name = "OpenRouter";

  isAvailable(): boolean {
    return !!process.env.OPENROUTER_API_KEY;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const apiKey = request.apiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("[AI] OpenRouter API key is missing");

    const models = request.model
      ? [request.model]
      : (
          process.env.NEXT_PUBLIC_OPENROUTER_FREE_MODEL ||
          "google/gemini-2.0-flash-exp:free"
        )
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean);

    // Try each model in order until one succeeds
    for (const model of models) {
      try {
        const body: Record<string, unknown> = {
          model,
          messages: [
            { role: "system", content: request.systemPrompt },
            { role: "user", content: request.userPrompt },
          ],
          temperature: request.temperature ?? 0,
          ...(request.maxTokens && { max_tokens: request.maxTokens }),
        };

        if (request.responseFormat?.type === "json_object") {
          body.response_format = { type: "json_object" };
        }

        const response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer":
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Get Hired AI",
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || "";
          if (content) {
            return { content, provider: this.id, model };
          }
        } else {
          const errorText = await response.text();
          console.warn(
            `[AI] OpenRouter model ${model} failed (${response.status}):`,
            errorText,
          );
        }
      } catch (err) {
        console.warn(`[AI] OpenRouter model ${model} fetch failed:`, err);
      }
    }

    throw new Error(`OpenRouter: all models failed (${models.join(", ")})`);
  }
}
