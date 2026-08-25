import { encode } from "@toon-format/toon";
import { prisma } from "@/lib/prisma";
import { aiComplete } from "@/lib/ai/server-ai";
import {
  buildCoverLetterUserPrompt,
  getCoverLetterSystemPrompt,
} from "@/lib/ai/prompts/cover-letter";

export type GenerateCoverLetterResult =
  | { ok: true; coverLetterId: string; coverLetterText: string }
  | { ok: false; status: number; error: string };

/**
 * Generates a cover letter via AI and saves it. Shared by the token-authenticated
 * agent API. Simpler than the UI route at
 * src/app/api/account/generate-cover-letter/route.ts (no keyword-extraction/bullet
 * ranking) — a good v1, same prompt builders and 2-record cap.
 */
export async function generateCoverLetterForUser(
  userId: string,
  opts: {
    jobDescription: string;
    format?: string;
    language?: string;
    resumeId?: string;
  },
): Promise<GenerateCoverLetterResult> {
  const jobDescription = (opts.jobDescription || "").trim();
  if (!jobDescription) {
    return { ok: false, status: 400, error: "jobDescription is required" };
  }

  const format = opts.format === "prose" ? "prose" : "bullet";
  const language = opts.language || "en";

  let profileData: {
    personalInfo: unknown;
    workExperience: unknown;
    education: unknown;
    skills: unknown;
  };

  if (opts.resumeId) {
    const resume = await prisma.resume.findFirst({
      where: { id: opts.resumeId, userId },
    });
    if (!resume) {
      return { ok: false, status: 404, error: "Resume not found" };
    }
    profileData = {
      personalInfo: resume.personalInfo ?? {},
      workExperience: resume.workExperience ?? [],
      education: resume.education ?? [],
      skills: resume.skills ?? [],
    };
  } else {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      return {
        ok: false,
        status: 400,
        error: "Profile not found. Please fill in your experience first.",
      };
    }
    profileData = {
      personalInfo: profile.personalInfo ?? {},
      workExperience: profile.workExperience ?? [],
      education: profile.education ?? [],
      skills: profile.skills ?? [],
    };
  }

  const profileToon = encode(profileData);
  const systemPrompt = getCoverLetterSystemPrompt(format);
  const userPrompt = buildCoverLetterUserPrompt({ jobDescription, profileToon });

  const response = await aiComplete(
    {
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 700,
    },
    userId,
  );

  const coverLetterText = response.content.trim();

  // Enforce the same 2-record cap as the UI route (evict oldest).
  const existingCount = await prisma.coverLetter.count({ where: { userId } });
  if (existingCount >= 2) {
    const oldest = await prisma.coverLetter.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    if (oldest) {
      await prisma.coverLetter.delete({ where: { id: oldest.id } });
    }
  }

  const saved = await prisma.coverLetter.create({
    data: {
      jobDescription,
      coverLetterText,
      format,
      language,
      userId,
      resumeId: opts.resumeId || null,
    },
  });

  return { ok: true, coverLetterId: saved.id, coverLetterText };
}
