import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from "../types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAIProvider implements AIProvider {
  id = "openai";
  name = "OpenAI";

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

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

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    if (!content) {
      throw new Error("OpenAI returned empty content");
    }

    return { content, provider: this.id, model };
  }
}
