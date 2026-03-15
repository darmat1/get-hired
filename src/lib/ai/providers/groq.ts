import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from "../types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export class GroqProvider implements AIProvider {
  id = "groq";
  name = "Groq";

  isAvailable(): boolean {
    return !!(process.env.GROQ_API_KEY || process.env.GH_GROQ_API_KEY);
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    return this._complete(request);
  }

  private async _complete(
    request: AICompletionRequest,
    isRetry = false,
  ): Promise<AICompletionResponse> {
    const apiKey = request.apiKey || process.env.GROQ_API_KEY || process.env.GH_GROQ_API_KEY;
    if (!apiKey) throw new Error("[AI] Groq API key is missing");

    const model =
      request.model || process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    const body: Record<string, unknown> = {
      model,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt },
      ],
      temperature: request.temperature ?? 0,
      max_tokens: request.maxTokens || 4096, // Default to a reasonable limit
    };

    if (request.responseFormat?.type === "json_object") {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();

      // If OpenAI model fails and we haven't retried yet, try fallback to Llama
      if (!isRetry) {
        if (model === "openai/gpt-oss-120b") {
          console.warn(
            `[AI] Groq: Model ${model} failed (${response.status}), retrying with llama-3.3-70b-versatile`,
          );
          return this._complete(
            {
              ...request,
              model: "llama-3.3-70b-versatile",
            },
            true,
          );
        } else if (
          response.status === 400 &&
          request.responseFormat?.type === "json_object"
        ) {
          // If JSON mode fails with a 400, try without it
          console.warn(
            `[AI] Groq: JSON mode failed for model ${model}, retrying without it`,
          );
          return this._complete(
            {
              ...request,
              responseFormat: undefined,
            },
            true,
          );
        }
      }

      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    if (!content) {
      // If we got empty content and haven't retried yet, try fallback
      if (!isRetry) {
        if (model === "openai/gpt-oss-120b") {
          console.warn(
            `[AI] Groq: Model ${model} returned empty content, retrying with llama-3.3-70b-versatile`,
          );
          return this._complete(
            {
              ...request,
              model: "llama-3.3-70b-versatile",
            },
            true,
          );
        } else if (request.responseFormat?.type === "json_object") {
          // If even Llama fails with JSON mode, try one last time without strict JSON mode
          console.warn(
            `[AI] Groq: Model ${model} returned empty content in JSON mode, retrying WITHOUT JSON mode`,
          );
          return this._complete(
            {
              ...request,
              responseFormat: undefined,
            },
            true,
          );
        }
      }
      throw new Error("Groq returned empty content");
    }

    return { content, provider: this.id, model };
  }
}
