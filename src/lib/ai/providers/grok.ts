import {
  AICompletionRequest,
  AICompletionResponse,
  AIProvider,
} from "../types";

export class GrokProvider implements AIProvider {
  id = "grok";
  name = "xAI Grok";

  isAvailable(): boolean {
    return !!process.env.XAI_API_KEY;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const apiKey = request.apiKey || process.env.XAI_API_KEY;
    if (!apiKey) throw new Error("[AI] xAI API key is missing");

    const model = request.model || process.env.XAI_MODEL || "grok-beta";

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens,
        response_format: request.responseFormat,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`xAI Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return { content, provider: this.id, model };
  }
}
