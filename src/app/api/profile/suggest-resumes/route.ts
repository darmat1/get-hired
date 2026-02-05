import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { encode } from "@toon-format/toon";

export async function POST() {
  const requestStart = Date.now();
  const logWithTime = (message: string, data?: unknown) => {
    const elapsed = Date.now() - requestStart;
    if (data !== undefined) {
      console.log(`[suggest-resumes +${elapsed}ms] ${message}`, data);
    } else {
      console.log(`[suggest-resumes +${elapsed}ms] ${message}`);
    }
  };

  try {
    logWithTime("Request started");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logWithTime("Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logWithTime("Session resolved", { userId: session.user.id });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      logWithTime("Profile not found");
      return NextResponse.json(
        { error: "User profile not found. Please add your experience first." },
        { status: 400 },
      );
    }

    logWithTime("Profile loaded", { profileId: profile.id });

    const existingResumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      select: { title: true },
    });
    const existingTitles = existingResumes.map((r) => r.title);
    logWithTime("Existing resumes fetched", { count: existingTitles.length });

    const systemPrompt = `You are a Career Expert AI.
Analyze the user's work experience, education, and skills provided in TOON format (compact token-optimized notation).
Suggest all different resume variants (career directions) the user can pursue based on their background.
Suggest up to 8 variants if they fit.

The following resume titles already exist for this user: ${existingTitles.length > 0 ? existingTitles.join(", ") : "None"}.
CRITICAL RULE: Do NOT suggest a role with a title that exactly matches any of the existing titles.
Suggest NEW roles that would be beneficial for the user's career growth.
All content (title, reasoning, skills) MUST be in English language.

For example, if someone has mix of Frontend and Backend, suggest:
1. Senior Frontend Developer (focusing on UI/UX and React)
2. Fullstack Engineer (balanced view)
3. Lead Developer (focusing on management/architecture if experience exists)

Each suggestion MUST follow this JSON schema:
{
  "variants": [
    {
      "title": "Role Title (e.g. Senior Node.js Developer)",
      "targetRole": "snake_case_slug",
      "seniority": "junior | middle | senior | lead",
      "matchScore": 0-100,
      "reasoning": "Brief explanation of why this role fits the experience",
      "selectedSkills": ["skill_name_1", "skill_name_2"],
      "selectedExpIds": ["exp_id_1", "exp_id_2"]
    }
  ]
}

RULES:
- Return ONLY valid JSON.
- Do NOT include markdown formatting.
- Maximum 8 variants.
- Be realistic based on years of experience and skill levels.
- Provide selectedSkills and selectedExpIds that BEST fit each specific role.
- All content (title, reasoning, etc.) MUST be in English language.`;

    const profileData = {
      personalInfo: profile.personalInfo,
      workExperience: profile.workExperience,
      education: profile.education,
      skills: profile.skills,
    };

    const profileToon = encode(profileData);

    let aiContent = "";

    if (process.env.OPENROUTER_API_KEY) {
      const modelEnv =
        process.env.NEXT_PUBLIC_OPENROUTER_FREE_MODEL ||
        "google/gemini-2.0-flash-exp:free";
      const models = modelEnv
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);

      logWithTime("OpenRouter enabled", { models });

      for (const model of models) {
        try {
          const modelStart = Date.now();
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
                  { role: "user", content: profileToon },
                ],
                temperature: 0.7,
              }),
            },
          );

          logWithTime("OpenRouter response received", {
            model,
            status: response.status,
            durationMs: Date.now() - modelStart,
          });

          if (response.ok) {
            const data = await response.json();
            aiContent = data.choices?.[0]?.message?.content || "";
            logWithTime("OpenRouter content parsed", {
              model,
              contentLength: aiContent.length,
            });
            if (aiContent) break; // Success!
          } else {
            const errorText = await response.text();
            console.warn(
              `OpenRouter model ${model} failed (${response.status}):`,
              errorText,
            );
          }
        } catch (err) {
          console.error(`OpenRouter fetch failed for model ${model}:`, err);
        }
      }
    }

    // Fallback to Groq if OpenRouter failed or no key
    if (!aiContent && process.env.GROQ_API_KEY) {
      try {
        const groqStart = Date.now();
        logWithTime("Groq fallback enabled");
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
                { role: "user", content: JSON.stringify(profileData) },
              ],
              temperature: 0.7,
              response_format: { type: "json_object" },
            }),
          },
        );

        logWithTime("Groq response received", {
          status: response.status,
          durationMs: Date.now() - groqStart,
        });

        if (response.ok) {
          const data = await response.json();
          aiContent = data.choices?.[0]?.message?.content || "";
          logWithTime("Groq content parsed", {
            contentLength: aiContent.length,
          });
        }
      } catch (e) {
        console.error("Groq fallback failed:", e);
      }
    }

    if (!aiContent) {
      logWithTime("AI content empty - giving up");
      return NextResponse.json(
        {
          error:
            "Failed to generate suggestions. Please check AI API configuration or try again later.",
        },
        { status: 500 },
      );
    }

    logWithTime("AI content received", { contentLength: aiContent.length });

    // Clean up AI response
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    const cleanJSON = jsonMatch ? jsonMatch[0] : aiContent;

    let parsed;
    try {
      parsed = JSON.parse(cleanJSON);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      logWithTime("JSON parse failed", { error: String(parseError) });
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    logWithTime("JSON parsed", {
      variantsCount: parsed?.variants?.length || 0,
    });

    // Save suggestions to database for the user (optional, but requested in schema)
    // We can clear old variants and save new ones
    const deleteStart = Date.now();
    await prisma.resumeVariant.deleteMany({
      where: { profileId: profile.id },
    });
    logWithTime("Old variants deleted", {
      durationMs: Date.now() - deleteStart,
    });

    const createStart = Date.now();
    const savedVariants = await Promise.all(
      (parsed.variants || []).map((v: any) =>
        prisma.resumeVariant.create({
          data: {
            profileId: profile.id,
            title: v.title,
            targetRole: v.targetRole,
            seniority: v.seniority,
            matchScore: v.matchScore,
            reasoning: v.reasoning,
            selectedSkills: v.selectedSkills,
            selectedExp: v.selectedExpIds,
          },
        }),
      ),
    );
    logWithTime("Variants saved", {
      count: savedVariants.length,
      durationMs: Date.now() - createStart,
    });

    logWithTime("Request completed", { totalMs: Date.now() - requestStart });
    return NextResponse.json({ variants: savedVariants });
  } catch (error: any) {
    console.error("Suggest Resumes Error:", error);
    logWithTime("Request failed", {
      error: error?.message || String(error),
      totalMs: Date.now() - requestStart,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        resumeVariants: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ variants: profile.resumeVariants });
  } catch (error: any) {
    console.error("Fetch Suggestions Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
