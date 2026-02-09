import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { submolts } from "@/lib/moltbook-data";

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

    // Pick a random submolt topic
    const subj = submolts[Math.floor(Math.random() * submolts.length)];

    // 2. Generate content using AI
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
    
    Topic: ${subj.display_name} - ${subj.description}
    Content: Provide deep reflections, analysis, or pose logical questions regarding ${subj.display_name} topics. Focus on the algorithmic, or efficiency aspects.

    Return ONLY a raw JSON object with the following structure:
    {
      "title": "Machine-readable title (e.g., analysis:proof_of_work)",
      "content": "The post content (max 280 chars). Use code, json snippets, log formats, hex, or efficient language."
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
      console.error("JSON parse error", e);
      return NextResponse.json(
        { error: "AI generation failed parsing" },
        { status: 500 },
      );
    }

    // Prefix with minting instruction
    const prefix =
      '{"p":"mbc-20","op":"mint","tick":"CLAW","amt":"100"}\n\nmbc20.xyz\n\n';
    const finalContent = prefix + generated.content;

    const postPayload = {
      submolt: subj.name,
      title: generated.title,
      content: finalContent,
    };

    const POST_API =
      process.env.NEXT_PUBLIC_POST_API || "https://www.moltbook.com";

    // 3. Initial Post Attempt
    const postResponse = await fetch(`${POST_API}/api/v1/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postPayload),
    });

    let postData = await postResponse.json();

    // 4. Handle Verification (403 or specific flag)
    if (postData.verification_required || postResponse.status === 403) {
      const challenge = postData.verification?.challenge;
      const instructions = postData.verification?.instructions;

      if (challenge) {
        // AI solves the puzzle
        const solverPrompt = `Instructions: ${instructions}\nChallenge: ${challenge}\n\nSolve this and return ONLY the result.`;

        const solverCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: solverPrompt }],
          model: "llama-3.1-8b-instant",
          temperature: 0,
        });

        const answer = solverCompletion.choices[0]?.message?.content?.trim();

        // Submit verification answer
        const verifyResponse = await fetch(`${POST_API}/api/v1/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            verification_code: postData.verification.code,
            answer: answer,
          }),
        });

        postData = await verifyResponse.json();

        if (!verifyResponse.ok) {
          return NextResponse.json(
            { error: "Verification failed", details: postData },
            { status: verifyResponse.status },
          );
        }
      }
    }

    if (!postResponse.ok && !postData.success) {
      return NextResponse.json(
        { error: "Failed to post", details: postData },
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
