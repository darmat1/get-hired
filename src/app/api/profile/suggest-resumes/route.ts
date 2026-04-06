import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { encode } from "@toon-format/toon";
import { buildResumeVariantsSystemPrompt } from "@/lib/ai/prompts/resume-variants";
import { executeStructuredAI } from "@/lib/ai/structured-output";

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

    const systemPrompt = buildResumeVariantsSystemPrompt(existingTitles);

    const profileData = {
      personalInfo: profile.personalInfo,
      workExperience: profile.workExperience,
      education: profile.education,
      skills: profile.skills,
    };

    const profileToon = encode(profileData);

    const aiStart = Date.now();
    const response = await executeStructuredAI<{ variants?: any[] }>(
      {
        systemPrompt,
        userPrompt: profileToon,
        temperature: 0.7,
      },
      session.user.id,
    );

    const aiContent = response.raw.content;
    logWithTime("AI response received", {
      provider: response.raw.provider,
      model: response.raw.model,
      contentLength: aiContent.length,
      durationMs: Date.now() - aiStart,
    });

    logWithTime("JSON parsed", {
      variantsCount: response.parsed?.variants?.length || 0,
    });

    const saveStart = Date.now();
    const updatedProfile = await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        resumeVariants: (response.parsed.variants || []).map(
          (v: any, index: number) => ({
            // Generate a stable unique id — AI doesn't return one
            id: `variant-${Date.now()}-${index}`,
            title: v.title,
            targetRole: v.targetRole,
            seniority: v.seniority,
            matchScore: v.matchScore,
            reasoning: v.reasoning,
            selectedSkills: v.selectedSkills || [],
            selectedExp: v.selectedExpIds || [],
            keywords: v.keywords || [],
            createdAt: new Date().toISOString(),
          }),
        ) as any,
      },
    });

    logWithTime("Variants saved to profile", {
      type: typeof updatedProfile.resumeVariants,
      count: Array.isArray(updatedProfile.resumeVariants)
        ? updatedProfile.resumeVariants.length
        : typeof updatedProfile.resumeVariants === "string"
          ? "string-length"
          : "not-countable",
      durationMs: Date.now() - saveStart,
    });

    logWithTime("Request completed", { totalMs: Date.now() - requestStart });
    const finalVariants = Array.isArray(updatedProfile.resumeVariants)
      ? updatedProfile.resumeVariants
      : typeof updatedProfile.resumeVariants === "string"
        ? JSON.parse(updatedProfile.resumeVariants)
        : [];

    return NextResponse.json({ variants: finalVariants });
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
    });

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    const variants = profile.resumeVariants;
    const parsedVariants = Array.isArray(variants)
      ? variants
      : typeof variants === "string"
        ? JSON.parse(variants)
        : [];

    return NextResponse.json({ variants: parsedVariants });
  } catch (error: any) {
    console.error("Fetch Suggestions Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
