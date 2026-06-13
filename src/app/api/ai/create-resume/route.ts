import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { executeStructuredAI } from "@/lib/ai/structured-output";

interface SelectionResult {
  title: string;
  selectedExpIds: string[];
  selectedSkillNames: string[];
}

function buildSelectionPrompt(profile: {
  workExperience: unknown[];
  education: unknown[];
  skills: unknown[];
  personalInfo: unknown;
}, targetRole: string, jobDescription?: string): string {
  const profileText = JSON.stringify({
    personalInfo: profile.personalInfo,
    workExperience: profile.workExperience,
    education: profile.education,
    skills: profile.skills,
  });

  const context = jobDescription
    ? `Create a resume for the following job:\n\n${jobDescription}\n\n`
    : `Create a general resume for the target role: "${targetRole}"\n\n`;

  return `${context}Given the candidate's profile below, select the most relevant experience and skills.

Profile (JSON):
${profileText}

Return ONLY valid JSON with this exact shape:
{
  "title": "<concise resume title, e.g. 'Senior React Developer — Acme Corp' or 'Senior React Developer Resume'>",
  "selectedExpIds": ["<id of relevant work experience>"],
  "selectedSkillNames": ["<name of relevant skill>"]
}

Rules:
- title: short, specific, max 60 chars
- selectedExpIds: IDs of work experience entries that are most relevant. Include at least 1, max all.
- selectedSkillNames: skill names from the profile that are relevant to the role/job. Include technical, language skills that match. Always include all language skills.
- Return ONLY JSON, no other text.`;
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { targetRole = "", jobDescription = "", template = "professional" } = body;

    if (!targetRole.trim() && !jobDescription.trim()) {
      return NextResponse.json({ error: "targetRole or jobDescription is required" }, { status: 400 });
    }

    // Check resume limit
    const resumeCount = await prisma.resume.count({ where: { userId: session.user.id } });
    if (resumeCount >= 2) {
      return NextResponse.json(
        { error: "Resume limit reached. Please delete an existing resume first.", limitReached: true },
        { status: 403 },
      );
    }

    // Load profile
    const profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found. Please fill in your experience first." }, { status: 400 });
    }

    const workExperience = Array.isArray(profile.workExperience) ? profile.workExperience : [];
    const skills = Array.isArray(profile.skills) ? (profile.skills as Array<{ name: string; category: string }>) : [];

    // Ask AI to select relevant experience + skills
    const aiResult = await executeStructuredAI<SelectionResult>(
      {
        systemPrompt: "You are a resume strategist. Return ONLY valid JSON, no markdown, no explanations.",
        userPrompt: buildSelectionPrompt(
          {
            workExperience,
            education: Array.isArray(profile.education) ? profile.education : [],
            skills,
            personalInfo: profile.personalInfo,
          },
          targetRole,
          jobDescription || undefined,
        ),
        temperature: 0.3,
        maxTokens: 600,
      },
      session.user.id,
    );

    const { title, selectedExpIds, selectedSkillNames } = aiResult.parsed;

    // Filter experience and skills
    const filteredExp = (workExperience as Array<{ id: string }>).filter((e) =>
      selectedExpIds?.includes(e.id),
    );
    // Fall back to all experience if AI returned nothing useful
    const finalExp = filteredExp.length > 0 ? filteredExp : workExperience;

    const selectedSkillSet = new Set(selectedSkillNames || []);
    const filteredSkills = skills.filter(
      (s) => s.category === "soft" || s.category === "language" || selectedSkillSet.has(s.name),
    );
    const finalSkills = filteredSkills.length > 0 ? filteredSkills : skills;

    // Build personalInfo
    const personalInfo: Record<string, unknown> = { ...(profile.personalInfo as object || {}) };
    if (!personalInfo.firstName && session.user.name) {
      const names = session.user.name.split(" ");
      personalInfo.firstName = names[0];
      if (names.length > 1) personalInfo.lastName = names.slice(1).join(" ");
    }
    if (!personalInfo.email) personalInfo.email = session.user.email;

    // Create resume
    const resume = await (prisma.resume.create as unknown as (args: unknown) => Promise<{ id: string; title: string }>)({
      data: {
        title: title || (targetRole ? `${targetRole} Resume` : "My Resume"),
        template,
        language: "en",
        personalInfo,
        workExperience: finalExp,
        education: Array.isArray(profile.education) ? profile.education : [],
        skills: finalSkills,
        certificates: Array.isArray(profile.certificates) ? profile.certificates : [],
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      resumeId: resume.id,
      title: resume.title,
      url: `/resume/${resume.id}/edit`,
    });
  } catch (err: unknown) {
    console.error("[create-resume error]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
