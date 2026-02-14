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
    return !!process.env.GROQ_API_KEY;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

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
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    if (!content) {
      throw new Error("Groq returned empty content");
    }

    return { content, provider: this.id, model };
  }
}
