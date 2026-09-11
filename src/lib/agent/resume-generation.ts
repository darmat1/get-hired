import { prisma } from "@/lib/prisma";
import { executeStructuredAI } from "@/lib/ai/structured-output";

interface SelectionResult {
  title: string;
  selectedExpIds: string[];
  selectedSkillNames: string[];
}

function buildSelectionPrompt(
  profile: {
    workExperience: unknown[];
    education: unknown[];
    skills: unknown[];
    personalInfo: unknown;
  },
  targetRole: string,
  jobDescription?: string,
): string {
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

export type GenerateResumeResult =
  | { ok: true; resumeId: string; title: string }
  | { ok: false; status: number; error: string; limitReached?: boolean };

/**
 * Selects relevant experience/skills from the user's profile via AI and
 * creates a new Resume. Shared by the session-authenticated UI route and
 * the token-authenticated agent API — single source of truth.
 */
export async function generateResumeForUser(
  userId: string,
  opts: {
    targetRole?: string;
    jobDescription?: string;
    template?: string;
    source?: "ai_ui" | "agent";
  },
): Promise<GenerateResumeResult> {
  const targetRole = opts.targetRole || "";
  const jobDescription = opts.jobDescription || "";
  const template = opts.template || "professional";

  if (!targetRole.trim() && !jobDescription.trim()) {
    return { ok: false, status: 400, error: "targetRole or jobDescription is required" };
  }

  // 1. Transaction to enforce rate limits and 2-record cap, reserving a slot.
  const txResult = await prisma.$transaction(async (tx) => {
    const resumeCount = await tx.resume.count({ where: { userId } });
    if (resumeCount >= 2) {
      return { limitReached: true, error: "Resume limit reached. Please delete an existing resume first." };
    }

    const lastResume = await tx.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    
    // Rate limit: 1 per minute
    if (lastResume && Date.now() - lastResume.createdAt.getTime() < 60000) {
      return { rateLimited: true, error: "Rate limit exceeded. Please wait a minute." };
    }

    const profile = await tx.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      return { noProfile: true, error: "Profile not found. Please fill in your experience first." };
    }

    // Create a draft resume to atomically reserve our quota slot
    const stub = await tx.resume.create({
      data: {
        userId,
        title: "Generating...",
        template,
        language: "en",
        personalInfo: {},
        workExperience: [],
        education: [],
        skills: [],
        source: opts.source || "ai_ui",
      },
    });

    return { stub, profile };
  });

  if ("limitReached" in txResult) {
    return { ok: false, status: 403, error: (txResult as { error: string }).error, limitReached: true };
  }
  if ("rateLimited" in txResult) {
    return { ok: false, status: 429, error: (txResult as { error: string }).error };
  }
  if ("noProfile" in txResult) {
    return { ok: false, status: 400, error: (txResult as { error: string }).error };
  }

  const { stub, profile } = txResult;

  try {
    const workExperience = Array.isArray(profile.workExperience) ? profile.workExperience : [];
    const skills = Array.isArray(profile.skills)
      ? (profile.skills as Array<{ name: string; category: string }>)
      : [];

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
      userId,
    );

    const { title, selectedExpIds, selectedSkillNames } = aiResult.parsed;

    const filteredExp = (workExperience as Array<{ id: string }>).filter((e) =>
      selectedExpIds?.includes(e.id),
    );
    const finalExp = filteredExp.length > 0 ? filteredExp : workExperience;

    const selectedSkillSet = new Set(selectedSkillNames || []);
    const filteredSkills = skills.filter(
      (s) => s.category === "soft" || s.category === "language" || selectedSkillSet.has(s.name),
    );
    const finalSkills = filteredSkills.length > 0 ? filteredSkills : skills;

    const personalInfo: Record<string, unknown> = { ...(profile.personalInfo as object || {}) };
    if (!personalInfo.firstName || !personalInfo.email) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!personalInfo.firstName && user?.name) {
        const names = user.name.split(" ");
        personalInfo.firstName = names[0];
        if (names.length > 1) personalInfo.lastName = names.slice(1).join(" ");
      }
      if (!personalInfo.email) personalInfo.email = user?.email;
    }

    const finalTitle = title || (targetRole ? `${targetRole} Resume` : "My Resume");

    // Update the reserved slot with real data
    await prisma.resume.update({
      where: { id: stub.id },
      data: {
        title: finalTitle,
        personalInfo,
        workExperience: finalExp,
        education: Array.isArray(profile.education) ? profile.education : [],
        skills: finalSkills,
        certificates: Array.isArray(profile.certificates) ? profile.certificates : [],
      },
    });

    return { ok: true, resumeId: stub.id, title: finalTitle };
  } catch (error) {
    // Clean up the draft slot if generation fails
    await prisma.resume.delete({ where: { id: stub.id } }).catch(() => {});
    return { ok: false, status: 500, error: "Failed to generate resume" };
  }
}
