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

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found. Please add your experience first." },
        { status: 400 },
      );
    }

    const systemPrompt = `You are a Career Expert AI.
Analyze the user's work experience, education, and skills.
Suggest up to 4 different resume variants (career directions) the user can pursue based on their background.

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
- Maximum 4 variants.
- Be realistic based on years of experience and skill levels.
- Provide selectedSkills and selectedExpIds that BEST fit each specific role.`;

    const profileData = {
      personalInfo: profile.personalInfo,
      workExperience: profile.workExperience,
      education: profile.education,
      skills: profile.skills,
    };

    let aiContent = "";

    // Try OpenRouter first
    if (process.env.OPENROUTER_API_KEY) {
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
              model: process.env.NEXT_PUBLIC_OPENROUTER_FREE_MODEL,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: JSON.stringify(profileData) },
              ],
              temperature: 0.7,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          aiContent = data.choices?.[0]?.message?.content || "";
        }
      } catch (err) {
        console.error("OpenRouter fetch failed:", err);
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
                { role: "user", content: JSON.stringify(profileData) },
              ],
              temperature: 0.7,
              response_format: { type: "json_object" },
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          aiContent = data.choices?.[0]?.message?.content || "";
        }
      } catch (e) {
        console.error("Groq fallback failed:", e);
      }
    }

    if (!aiContent) {
      return NextResponse.json(
        { error: "Failed to generate suggestions" },
        { status: 500 },
      );
    }

    // Clean up AI response (extract JSON if it includes markdown)
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    const cleanJSON = jsonMatch ? jsonMatch[0] : aiContent;
    const parsed = JSON.parse(cleanJSON);

    // Save suggestions to database for the user (optional, but requested in schema)
    // We can clear old variants and save new ones
    await prisma.resumeVariant.deleteMany({
      where: { profileId: profile.id },
    });

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

    return NextResponse.json({ variants: savedVariants });
  } catch (error: any) {
    console.error("Suggest Resumes Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
