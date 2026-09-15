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
    source?: "ai_ui" | "agent";
  },
): Promise<GenerateCoverLetterResult> {
  const jobDescription = (opts.jobDescription || "").trim();
  if (!jobDescription) {
    return { ok: false, status: 400, error: "jobDescription is required" };
  }

  const format = opts.format === "prose" ? "prose" : "bullet";
  const language = opts.language || "en";

  // 1. Transaction to reserve slot and rate limit
  const txResult = await prisma.$transaction(async (tx) => {
    const lastCL = await tx.coverLetter.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    
    // Rate limit: 1 per minute
    if (lastCL && Date.now() - lastCL.createdAt.getTime() < 60000) {
      return { rateLimited: true, error: "Rate limit exceeded. Please wait a minute." };
    }

    const existingCount = await tx.coverLetter.count({ where: { userId } });
    if (existingCount >= 2) {
      const oldest = await tx.coverLetter.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
      if (oldest) {
        await tx.coverLetter.delete({ where: { id: oldest.id } });
      }
    }

    // Create draft to reserve quota slot
    const stub = await tx.coverLetter.create({
      data: {
        userId,
        jobDescription,
        coverLetterText: "Generating...",
        format,
        language,
        resumeId: opts.resumeId || null,
        source: opts.source || "ai_ui",
      },
    });

    return { stub };
  });

  if ("rateLimited" in txResult) {
    return { ok: false, status: 429, error: (txResult as { error: string }).error };
  }

  const { stub } = txResult;

  try {
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
        throw new Error("Resume not found");
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
        throw new Error("Profile not found. Please fill in your experience first.");
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

    // Update draft with generated text
    await prisma.coverLetter.update({
      where: { id: stub.id },
      data: { coverLetterText },
    });

    return { ok: true, coverLetterId: stub.id, coverLetterText };
  } catch (error: any) {
    // Clean up draft on failure
    await prisma.coverLetter
      .delete({ where: { id: stub.id } })
      .catch((err) => console.warn("[cover-letter-generation] Failed to clean up draft stub:", err));
    return { ok: false, status: error.message.includes("not found") ? 400 : 500, error: error.message || "Failed to generate cover letter" };
  }
}
