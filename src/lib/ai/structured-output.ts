import { aiComplete } from "./server-ai";
import type { AICompletionRequest, AICompletionResponse } from "./types";
import { parseAIJsonResponse } from "./parse-json-response";

export interface StructuredAIResult<T> {
  parsed: T;
  raw: AICompletionResponse;
}

export async function executeStructuredAI<T>(
  request: Omit<AICompletionRequest, "responseFormat">,
  userId?: string,
): Promise<StructuredAIResult<T>> {
  const raw = await aiComplete(
    {
      ...request,
      responseFormat: { type: "json_object" },
    },
    userId,
  );

  return {
    parsed: parseAIJsonResponse<T>(raw.content),
    raw,
  };
}
