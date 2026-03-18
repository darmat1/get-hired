import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { aiKeys: true },
    });

    const geminiKey = user?.aiKeys.find((k) => k.provider === "gemini")?.key;

    if (!geminiKey) {
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file required" }, { status: 400 });
    }

    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Audio = buffer.toString("base64");

    const model = "gemini-1.5-flash-8b";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: audioFile.type || "audio/webm",
                  data: base64Audio,
                },
              },
              {
                text: "Transcribe this audio to text in the same language as the speech. If it's empty or contains only noise, return empty string.",
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Gemini API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transcription =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ transcription });
  } catch (error: any) {
    console.error("Voice transcription error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
