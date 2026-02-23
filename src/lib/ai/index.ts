export { getAvailableProviders, getAllProviders } from "./ai-client";

export type {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from "./types";

// NOTE: Do NOT export aiComplete from here if it is used in Client Components.
// Server-side code should import from @/lib/ai/server-ai directly.
