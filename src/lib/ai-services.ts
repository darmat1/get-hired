import { getAllProviders } from "./ai/registry";

export interface AIService {
  id: string;
  name: string;
  descriptionKey: string;
  isFree: boolean;
  status: "connected" | "disconnected" | "configured";
  apiKey?: string;
}

export function getAvailableAIServices(): AIService[] {
  const providers = getAllProviders();

  const services: AIService[] = providers.map((p) => {
    let envKey = "";
    switch (p.id) {
      case "groq":
        envKey = process.env.GROQ_API_KEY || "";
        break;
      case "openai":
        envKey = process.env.OPENAI_API_KEY || "";
        break;
      case "openrouter":
        envKey = process.env.OPENROUTER_API_KEY || "";
        break;
      case "claude":
        envKey = process.env.ANTHROPIC_API_KEY || "";
        break;
      case "gemini":
        envKey = process.env.GOOGLE_API_KEY || "";
        break;
      case "grok":
        envKey = process.env.XAI_API_KEY || "";
        break;
    }

    return {
      id: p.id,
      name: p.name,
      descriptionKey: `ai_service.${p.id}.description`,
      isFree: p.id === "groq" || p.id === "openrouter" || p.id === "gemini",
      status: envKey ? "connected" : "disconnected",
      apiKey: envKey,
    };
  });

  return services.sort((a, b) => {
    // Groq always comes first as it's the free/recommended option
    if (a.id === "groq") return -1;
    if (b.id === "groq") return 1;

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

export async function testAIService(
  service: AIService | { name: string; apiKey: string; id: string },
): Promise<boolean> {
  try {
    if (service.id === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${service.apiKey}` },
      });
      return res.ok;
    } else if (service.id === "groq") {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${service.apiKey}` },
      });
      return res.ok;
    } else if (service.id === "openrouter") {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${service.apiKey}` },
      });
      return res.ok;
    } else if (service.id === "claude") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": service.apiKey!,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "Hi" }],
        }),
      });
      return res.ok;
    } else if (service.id === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${service.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] }),
        },
      );
      return res.ok;
    } else if (service.id === "grok") {
      const res = await fetch("https://api.x.ai/v1/models", {
        headers: { Authorization: `Bearer ${service.apiKey}` },
      });
      return res.ok;
    }
  } catch (error) {
    console.error(`${service.name} test failed:`, error);
  }
  return false;
}

export const AISetupInstructions: Record<string, any> = {
  groq: {
    name: "Groq",
    stepKeys: [
      "ai_setup.groq.step1",
      "ai_setup.groq.step2",
      "ai_setup.groq.step3",
      "ai_setup.groq.step4",
      "ai_setup.groq.step5",
    ],
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
  },
  claude: {
    name: "Claude",
    stepKeys: [
      "ai_setup.claude.step1",
      "ai_setup.claude.step2",
      "ai_setup.claude.step3",
      "ai_setup.claude.step4",
      "ai_setup.claude.step5",
    ],
  },
  gemini: {
    name: "Gemini",
    stepKeys: [
      "ai_setup.gemini.step1",
      "ai_setup.gemini.step2",
      "ai_setup.gemini.step3",
    ],
  },
  grok: {
    name: "Grok",
    stepKeys: ["ai_setup.grok.step1", "ai_setup.grok.step2"],
  },
  openrouter: {
    name: "OpenRouter",
    stepKeys: ["ai_setup.openrouter.step1", "ai_setup.openrouter.step2"],
  },
};
