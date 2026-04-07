import {
  AICompletionRequest,
  AICompletionResponse,
  AIProvider,
} from "../types";

export class GeminiProvider implements AIProvider {
  id = "gemini";
  name = "Google Gemini";

  isAvailable(): boolean {
    return !!process.env.GOOGLE_API_KEY;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    return this._complete(request, true, true);
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async _complete(
    request: AICompletionRequest,
    withThinking: boolean,
    allowModelFallback: boolean,
    retryCount = 0,
  ): Promise<AICompletionResponse> {
    const apiKey = request.apiKey || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("[AI] Google API key is missing");

    const model =
      request.model || process.env.GOOGLE_MODEL || "gemini-2.5-flash";

    const controller = new AbortController();
    const timeoutMs = request.timeoutMs || 120000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal as any,
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: `${request.systemPrompt}\n\n${request.userPrompt}` },
                ],
              },
            ],
            generationConfig: {
              temperature: request.temperature ?? 0.7,
              maxOutputTokens: request.maxTokens || 4096,
              responseMimeType:
                request.responseFormat?.type === "json_object"
                  ? "application/json"
                  : "text/plain",
              ...(withThinking ? { thinking_level: "MINIMAL" } : {}),
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();

        // If Google doesn't recognize thinking_level for this model — retry without it
        if (
          withThinking &&
          response.status === 400 &&
          errorText.includes("thinking_level")
        ) {
          console.warn(
            `[AI] Gemini: thinking_level not supported for model "${model}", retrying without it`,
          );
          return this._complete(request, false, allowModelFallback, retryCount);
        }

        // Preview / unavailable model for this account or endpoint.
        // Retry on the same provider with a stable fallback instead of failing over to another provider.
        if (allowModelFallback && response.status === 404 && request.model) {
          const fallbackModel =
            request.responseFormat?.type === "json_object"
              ? "gemini-2.5-flash"
              : "gemini-2.5-flash";
          if (model !== fallbackModel) {
            console.warn(
              `[AI] Gemini: model "${model}" returned 404, retrying with fallback "${fallbackModel}"`,
            );
            return this._complete(
              {
                ...request,
                model: fallbackModel,
              },
              withThinking,
              false,
              retryCount,
            );
          }
        }

        if (response.status === 503 && retryCount < 3) {
          const backoffMs = 1500 * Math.pow(2, retryCount);
          console.warn(
            `[AI] Gemini: model "${model}" unavailable (503), retrying in ${backoffMs}ms (attempt ${retryCount + 1}/3)`,
          );
          await this.sleep(backoffMs);
          return this._complete(
            request,
            withThinking,
            allowModelFallback,
            retryCount + 1,
          );
        }

        throw new Error(`Google Gemini Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (
        data.candidates?.[0]?.finishReason &&
        data.candidates[0].finishReason !== "STOP"
      ) {
        console.warn(
          `[AI] Gemini Finish Reason: ${data.candidates[0].finishReason}`,
        );
        if (data.candidates[0].finishReason === "SAFETY") {
          console.warn(
            "[AI] Safety ratings:",
            JSON.stringify(data.candidates[0].safetyRatings),
          );
        }
      }

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!content && data.candidates?.[0]?.finishReason) {
        throw new Error(
          `Google Gemini failed with reason: ${data.candidates[0].finishReason}`,
        );
      }

      return { content, provider: this.id, model };
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error(
          `[AI] Google Gemini request timed out after ${Math.round(timeoutMs / 1000)}s`,
        );
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
