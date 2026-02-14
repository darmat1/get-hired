import { getAllProviders } from "@/lib/ai";

export interface AIService {
  name: string;
  descriptionKey: string;
  isFree: boolean;
  status: "connected" | "disconnected" | "configured";
  apiKey?: string;
}

export function getAvailableAIServices(): AIService[] {
  const services: AIService[] = [
    {
      name: "Groq",
      descriptionKey: "ai_service.groq.description",
      isFree: true,
      status: process.env.GROQ_API_KEY ? "connected" : "disconnected",
      apiKey: process.env.GROQ_API_KEY,
    },
    {
      name: "OpenAI",
      descriptionKey: "ai_service.openai.description",
      isFree: false,
      status: process.env.OPENAI_API_KEY ? "connected" : "disconnected",
      apiKey: process.env.OPENAI_API_KEY,
    },
    {
      name: "OpenRouter",
      descriptionKey: "ai_service.openrouter.description",
      isFree: true,
      status: process.env.OPENROUTER_API_KEY ? "connected" : "disconnected",
      apiKey: process.env.OPENROUTER_API_KEY,
    },
  ];

  return services.sort((a, b) => {
    if (a.isFree !== b.isFree) {
      return a.isFree ? -1 : 1;
    }
    if (a.status !== b.status) {
      return a.status === "connected" ? -1 : 1;
    }
    return 0;
  });
}

export function getCurrentAIService(): AIService | null {
  const services = getAvailableAIServices();
  return services.find((s) => s.status === "connected") || null;
}

/**
 * Get the current provider priority order for display in UI.
 */
export function getProviderOrder(): string[] {
  return getAllProviders().map((p) => p.name);
}

export async function testAIService(service: AIService): Promise<boolean> {
  try {
    if (service.name === "OpenAI") {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${service.apiKey}`,
        },
      });
      return response.ok;
    } else if (service.name === "Groq") {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: {
          Authorization: `Bearer ${service.apiKey}`,
        },
      });
      return response.ok;
    } else if (service.name === "OpenRouter") {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          Authorization: `Bearer ${service.apiKey}`,
        },
      });
      return response.ok;
    }
  } catch (error) {
    console.error(`${service.name} test failed:`, error);
  }
  return false;
}

export const AISetupInstructions = {
  groq: {
    name: "Groq",
    stepKeys: [
      "ai_setup.groq.step1",
      "ai_setup.groq.step2",
      "ai_setup.groq.step3",
      "ai_setup.groq.step4",
      "ai_setup.groq.step5",
    ],
    limitsKey: "ai_service.groq.limits",
  },
  openai: {
    name: "OpenAI",
    stepKeys: [
      "ai_setup.openai.step1",
      "ai_setup.openai.step2",
      "ai_setup.openai.step3",
      "ai_setup.openai.step4",
      "ai_setup.openai.step5",
    ],
    limitsKey: "ai_service.openai.limits",
  },
};
