import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { OpenRouter } from "@openrouter/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";
import { buildBlogContentPrompts } from "@/lib/ai/prompts/blog-content";
import { parseAIJsonResponse } from "@/lib/ai/parse-json-response";
import { executeStructuredAI } from "@/lib/ai/structured-output";

const TRINITY_MODEL = "arcee-ai/trinity-large-preview:free";
const STEPFUN_MODEL = "stepfun/step-3.5-flash:free";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_LITE_MODEL = "gemini-3.5-flash-lite";

const OPENROUTER_MODELS: Record<string, string> = {
  "openrouter-trinity": TRINITY_MODEL,
  "openrouter-stepfun": STEPFUN_MODEL,
};

async function getUserApiKey(userId: string, provider: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { aiKeys: true },
  });
  return user?.aiKeys.find((k) => k.provider === provider)?.key;
}

async function generateWithOpenRouter(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model: string,
) {
  console.log("[OpenRouter] Starting request with model:", model);

  const openrouter = new OpenRouter({ apiKey });

  try {
    const startTime = Date.now();
    const response = await openrouter.chat.send({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    console.log(
      "[OpenRouter] Response received in",
      Date.now() - startTime,
      "ms",
    );

    const content = response.choices[0]?.message?.content;
    if (!content) return "";
    if (typeof content === "string") return content;

    for (const item of content) {
      if ("text" in item && typeof item.text === "string") return item.text;
    }
    return "";
  } catch (error) {
    console.error("[OpenRouter] Error:", error);
    throw error;
  }
}

async function generateWithGroq(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
) {
  console.log("[Groq] Starting request");

  const groq = new Groq({ apiKey });

  try {
    const startTime = Date.now();
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 3000,
    });
    console.log("[Groq] Response received in", Date.now() - startTime, "ms");

    return response.choices[0]?.message?.content ?? "";
  } catch (error) {
    console.error("[Groq] Error:", error);
    throw error;
  }
}

async function generateWithGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  modelName: string = GEMINI_MODEL,
) {
  console.log("[Gemini] Starting request with model:", modelName);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
      maxOutputTokens: 8192,
    },
  });

  try {
    const startTime = Date.now();
    const result = await model.generateContent(userPrompt);
    console.log("[Gemini] Response received in", Date.now() - startTime, "ms");

    return result.response.text();
  } catch (error) {
    console.error("[Gemini] Error:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userRole = (session?.user as any)?.role?.toLowerCase();
    if (!session || !["superadmin", "admin", "publisher"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, requirements, provider } = await request.json();
    if (!topic || !requirements) {
      return NextResponse.json(
        { error: "Topic and requirements are required" },
        { status: 400 },
      );
    }

    const prompts = buildBlogContentPrompts(topic, requirements);

    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User authentication required" },
        { status: 400 },
      );
    }

    let results: Record<string, string>;

    if (provider === "groq") {
      const groqKey = await getUserApiKey(userId, "groq");
      if (!groqKey) {
        return NextResponse.json(
          {
            error:
              "Groq API key not found. Please add it in your profile settings.",
          },
          { status: 400 },
        );
      }

      const responses = await Promise.all(
        prompts.map((p) =>
          generateWithGroq(groqKey, p.systemPrompt, p.userPrompt),
        ),
      );
      results = { en: responses[0], ru: responses[1], uk: responses[2] };
    } else if (provider === "gemini") {
      const geminiKey = await getUserApiKey(userId, "gemini");
      if (!geminiKey) {
        return NextResponse.json(
          {
            error:
              "Gemini API key not found. Please add it in your profile settings.",
          },
          { status: 400 },
        );
      }

      const responses = await Promise.all(
        prompts.map((p) =>
          generateWithGemini(geminiKey, p.systemPrompt, p.userPrompt),
        ),
      );
      results = { en: responses[0], ru: responses[1], uk: responses[2] };
    } else if (provider === "gemini-lite") {
      const geminiKey = await getUserApiKey(userId, "gemini");
      if (!geminiKey) {
        return NextResponse.json(
          {
            error:
              "Gemini API key not found. Please add it in your profile settings.",
          },
          { status: 400 },
        );
      }

      const responses = await Promise.all(
        prompts.map((p) =>
          generateWithGemini(
            geminiKey,
            p.systemPrompt,
            p.userPrompt,
            GEMINI_LITE_MODEL,
          ),
        ),
      );
      results = { en: responses[0], ru: responses[1], uk: responses[2] };
    } else if (provider?.startsWith("openrouter")) {
      const openRouterKey = await getUserApiKey(userId, "openrouter");
      if (!openRouterKey) {
        return NextResponse.json(
          {
            error:
              "OpenRouter API key not found. Please add it in your profile settings.",
          },
          { status: 400 },
        );
      }

      const model = OPENROUTER_MODELS[provider];
      if (!model) {
        return NextResponse.json(
          { error: "Invalid provider" },
          { status: 400 },
        );
      }

      const responses = await Promise.all(
        prompts.map((p) =>
          generateWithOpenRouter(
            openRouterKey,
            p.systemPrompt,
            p.userPrompt,
            model,
          ),
        ),
      );
      results = { en: responses[0], ru: responses[1], uk: responses[2] };
    } else {
      // Default: aiComplete (built-in provider)
      const [enRes, ruRes, ukRes] = await Promise.all([
        executeStructuredAI<{ title?: string; excerpt?: string; body?: string }>(
          {
            systemPrompt: prompts[0].systemPrompt,
            userPrompt: prompts[0].userPrompt,
            temperature: 0.4,
            maxTokens: 3000,
          },
          userId,
        ),
        executeStructuredAI<{ title?: string; excerpt?: string; body?: string }>(
          {
            systemPrompt: prompts[1].systemPrompt,
            userPrompt: prompts[1].userPrompt,
            temperature: 0.4,
            maxTokens: 3000,
          },
          userId,
        ),
        executeStructuredAI<{ title?: string; excerpt?: string; body?: string }>(
          {
            systemPrompt: prompts[2].systemPrompt,
            userPrompt: prompts[2].userPrompt,
            temperature: 0.4,
            maxTokens: 3000,
          },
          userId,
        ),
      ]);

      results = {
        en: enRes.raw.content,
        ru: ruRes.raw.content,
        uk: ukRes.raw.content,
      };
    }

    const parseAiResponse = (resContent: string, fallbackTopic: string) => {
      try {
        const parsed = parseAIJsonResponse<{
          title?: string;
          excerpt?: string;
          body?: string;
        }>(resContent);
        return {
          title: parsed.title || fallbackTopic,
          excerpt: parsed.excerpt || "",
          body: parsed.body || "<p>Content generation failed.</p>",
        };
      } catch (e) {
        console.error("Failed to parse AI JSON:", resContent);
        return {
          title: fallbackTopic,
          excerpt: "",
          body: `<p>${resContent}</p>`,
        };
      }
    };

    const content = {
      en: parseAiResponse(results.en, topic),
      ru: parseAiResponse(results.ru, topic),
      uk: parseAiResponse(results.uk, topic),
    };

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error generating blog content:", error);
    return NextResponse.json(
      { error: "Error generating blog content" },
      { status: 500 },
    );
  }
}
