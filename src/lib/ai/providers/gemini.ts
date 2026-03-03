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
    const apiKey = request.apiKey || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("[AI] Google API key is missing");

    const model =
      request.model || process.env.GOOGLE_MODEL || "gemini-2.5-flash";
    const isGemini3 = model.startsWith("gemini-3");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

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
              ...(isGemini3 ? { thinking_level: "MINIMAL" } : {}),
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
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
        throw new Error("[AI] Google Gemini request timed out (over 2 min)");
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
