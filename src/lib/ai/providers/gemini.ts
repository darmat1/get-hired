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

    const model = request.model || process.env.GOOGLE_MODEL || "gemini-1.5-pro";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Gemini Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return { content, provider: this.id, model };
  }
}
