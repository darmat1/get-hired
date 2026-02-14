import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { encode } from "@toon-format/toon";
import { aiComplete } from "@/lib/ai";

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
Analyze the user's work experience, education, and skills provided in TOON format.
Suggest up to 8 different resume variants (career directions) based on their background.

Existing resume titles (DO NOT suggest duplicates): ${existingTitles.length > 0 ? existingTitles.join(", ") : "None"}.

RETURN YOUR RESPONSE IN JSON FORMAT:
{
  "variants": [
    {
      "title": "Role Title",
      "targetRole": "Role Title",
      "seniority": "junior | middle | senior | lead",
      "matchScore": 85,
      "reasoning": "Brief explanation",
      "selectedSkills": ["skill1", "skill2"],
      "selectedExpIds": ["exp_id1", "exp_id2"]
    }
  ]
}

RULES:
- Return ONLY valid JSON (no TOON, no markdown blocks).
- Maximum 8 variants.
- All content MUST be in English.`;

    const profileData = {
      personalInfo: profile.personalInfo,
      workExperience: profile.workExperience,
      education: profile.education,
      skills: profile.skills,
    };

    const profileToon = encode(profileData);

    const aiStart = Date.now();
    const response = await aiComplete({
      systemPrompt,
      userPrompt: profileToon,
      temperature: 0.7,
      responseFormat: { type: "json_object" },
    });

    const aiContent = response.content;
    logWithTime("AI response received", {
      provider: response.provider,
      model: response.model,
      contentLength: aiContent.length,
      durationMs: Date.now() - aiStart,
    });

    // Parse JSON response
    let parsed: { variants?: any[] };
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      const cleanJSON = jsonMatch ? jsonMatch[0] : aiContent;
      parsed = JSON.parse(cleanJSON);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      logWithTime("JSON parse failed", { error: String(parseError) });
      return NextResponse.json(
        { error: "Failed to parse AI response", content: aiContent },
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
