import {
  AICompletionRequest,
  AICompletionResponse,
  AIProvider,
} from "../types";

export class ClaudeProvider implements AIProvider {
  id = "claude";
  name = "Claude (Anthropic)";

  isAvailable(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const apiKey = request.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("[AI] Anthropic API key is missing");

    const model =
      request.model ||
      process.env.ANTHROPIC_MODEL ||
      "claude-3-5-sonnet-20240620";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature ?? 0.7,
        system: request.systemPrompt,
        messages: [{ role: "user", content: request.userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      provider: this.id,
      model,
    };
  }
}
