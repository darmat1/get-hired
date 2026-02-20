import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { aiComplete } from "@/lib/ai";
import type { AICompletionRequest } from "@/lib/ai/types";

// Centralized API to complete AI prompts using per-user credentials
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const {
      systemPrompt,
      userPrompt,
      temperature,
      maxTokens,
      responseFormat,
      model,
    } = payload as AICompletionRequest;

    const aiResponse = await aiComplete(
      {
        systemPrompt,
        userPrompt,
        temperature,
        maxTokens,
        responseFormat,
        model,
      },
      session.user.id
    );

    return NextResponse.json({ content: aiResponse.content, provider: aiResponse.provider, model: aiResponse.model });
  } catch (err: any) {
    console.error("[AI API complete error]:", err);
    return NextResponse.json({ error: err?.message ?? "Internal error" }, { status: 500 });
  }
}
