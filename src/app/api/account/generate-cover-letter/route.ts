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
    const systemPrompt = `You are a professional Candidate applying for a job.

### 1. LANGUAGE ENFORCEMENT (ABSOLUTE PRIORITY)
- **Step 1: Detect JD Language** by looking for "Stop Words" (words that only exist in one language):
  - "та", "або", "що", "для", "вимоги", "ми" -> **UKRAINIAN**.
  - "и", "или", "что", "для", "требования", "мы" -> **RUSSIAN**.
  - "and", "or", "that", "for", "requirements", "we" -> **ENGLISH**.
- **Step 2: TRANSLATE**: If the Candidate Profile is in English, but the JD is in Ukrainian, you **MUST TRANSLATE** the candidate's achievements into Ukrainian for the response.
- **Rule**: The output must match the **JD's language** 100%.

### 2. FORMATTING (PLAIN TEXT ONLY)
- **NO MARKDOWN**: No asterisks (** or *).
- **NO BOLD**: Do not use bold text.
- **Style**: Use a simple hyphen list ("- Skill: Result").

### 3. DATA INTEGRITY (ANTI-HALLUCINATION)
- **Source**: Use ONLY facts from the "CANDIDATE PROFILE".
- **No Inventions**: Do not invent numbers. If a specific metric isn't in the profile, describe the outcome qualitatively.

### 4. OUTPUT STRUCTURE
[One direct sentence in DETECTED LANGUAGE stating interest in the role]

- [Matching Fact from Profile (Translated if needed)]
- [Matching Fact from Profile (Translated if needed)]
- [Matching Fact from Profile (Translated if needed)]

[Closing sentence in DETECTED LANGUAGE]`;

    const userPrompt = `JOB DESCRIPTION (Analyze stop words for language):
${jobDescription}

CANDIDATE PROFILE (Source of facts - TRANSLATE these if needed):
${profileToon}

Write the plain-text response letter now. Temperature is 0.`;

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
              temperature: 0,
              max_tokens: 10000,
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
