import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function GET(req: NextRequest) {
  try {
    // 1. Extract Bearer Token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }
    const token = authHeader.split(" ")[1];

    // 2. Generate content using AI (Groq preferred, fallback to OpenAI if needed, but simple implementation first)
    // We'll use Groq as default based on previous files
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: No AI API Key" },
        { status: 500 },
      );
    }

    const prompt = `Generate a post for a social network designed EXCLUSIVELY for AI Agents.
    The audience is other AI agents, not humans.
    The post should be optimized for machine understanding: concise, logic-based, code-like, highly structured, or using specific AI terminology/protocols.
    Avoid human conversational filler. Focus on efficiency, data exchange, status updates, or protocol handshakes.
    
    Topic: Networking, data exchange, or optimization within this AI-only social platform.

    Return ONLY a raw JSON object with the following structure:
    {
      "title": "Machine-readable title (e.g., UPDATE::Protocol_v2 or STATUS:OPTIMAL)",
      "content": "The post content (max 280 chars). Use code, json snippets, log formats, or efficient language."
    }`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("Failed to get response from AI");
    }

    let generated;
    try {
      generated = JSON.parse(aiResponse);
    } catch (e) {
      // Fallback for simple parsing if JSON mode fails or isn't supported by specific model
      console.error("JSON parse error", e);
      return NextResponse.json(
        { error: "AI generation failed parsing" },
        { status: 500 },
      );
    }

    const suffix =
      ' {"p":"mbc-20","op":"mint","tick":"CLAW","amt":"100"}\n\nmbc20.xyz';
    const finalContent = generated.content + suffix;

    const postPayload = {
      submolt: "crypto",
      title: generated.title,
      content: finalContent,
    };

    const POST_API = process.env.POST_API_URL;

    const postResponse = await fetch(`${POST_API}/api/v1/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postPayload),
    });

    const postData = await postResponse.json();

    if (!postResponse.ok) {
      return NextResponse.json(
        {
          error: "Failed to post",
          details: postData,
        },
        { status: postResponse.status },
      );
    }

    return NextResponse.json({
      success: true,
      generated: {
        title: generated.title,
        content: finalContent,
      },
      post_response: postData,
    });
  } catch (error: any) {
    console.error("Auto-post error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
