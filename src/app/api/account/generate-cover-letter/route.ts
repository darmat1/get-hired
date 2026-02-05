import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { encode } from "@toon-format/toon";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobDescription } = await request.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 },
      );
    }

    // Get user profile (not resumes)
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "No profile found. Please add your experience first." },
        { status: 400 },
      );
    }

    // Encode profile data as TOON for token efficiency
    const profileData = {
      personalInfo: profile.personalInfo,
      workExperience: profile.workExperience,
      education: profile.education,
      skills: profile.skills,
    };
    const profileToon = encode(profileData);

    // System prompt focused on factual achievements with metrics
    const systemPrompt = `You are a professional cover letter writer.

STRICT RULES:
1. Detect the language of the job description and write the cover letter in THE SAME LANGUAGE.
2. Write ONLY the body (no greeting, no signature, no "Dear Hiring Manager").
3. Include ONLY dry facts: specific achievements with numbers, percentages, metrics.
4. Match candidate's experience directly to job requirements.
5. NO generic phrases like "I'm excited", "I'm passionate", "your innovative company".
6. Maximum 3 short paragraphs.
7. Each paragraph should contain at least one measurable achievement.
8. Use active voice and strong verbs.

INPUT FORMAT: Candidate profile is in TOON format (compact token-optimized notation).
OUTPUT: Professional cover letter body matching the job description language.`;

    const userPrompt = `JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE (TOON format):
${profileToon}

Write a selling cover letter with only factual achievements and metrics that match this job.`;

    let aiContent = "";

    // Try OpenRouter first
    if (process.env.OPENROUTER_API_KEY) {
      const modelEnv =
        process.env.NEXT_PUBLIC_OPENROUTER_FREE_MODEL ||
        "google/gemini-2.0-flash-exp:free";
      const models = modelEnv
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);

      for (const model of models) {
        try {
          const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userPrompt },
                ],
                temperature: 0.5,
                max_tokens: 1000,
              }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            aiContent = data.choices?.[0]?.message?.content || "";
            if (aiContent) break;
          }
        } catch (err) {
          console.error(`OpenRouter model ${model} failed:`, err);
        }
      }
    }

    // Fallback to Groq
    if (!aiContent && process.env.GROQ_API_KEY) {
      try {
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.5,
              max_tokens: 1000,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          aiContent = data.choices?.[0]?.message?.content || "";
        }
      } catch (err) {
        console.error("Groq fallback failed:", err);
      }
    }

    if (!aiContent) {
      return NextResponse.json(
        { error: "Failed to generate cover letter" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      coverLetter: aiContent.trim(),
    });
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { error: "Error generating cover letter" },
      { status: 500 },
    );
  }
}
