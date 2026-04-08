// src/app/api/account/generate-cover-letter/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { encode } from "@toon-format/toon";
import { aiComplete } from "@/lib/ai/server-ai";
import { executeStructuredAI } from "@/lib/ai/structured-output";
import {
  buildCoverLetterUserPrompt,
  buildTailoredResumeUserPrompt,
  getCoverLetterSystemPrompt,
  getTailoredResumeSystemPrompt,
} from "@/lib/ai/prompts/cover-letter";
import type { Education, Skill, WorkExperience } from "@/types/resume";

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "you",
  "your",
  "are",
  "will",
  "into",
  "across",
  "using",
  "use",
  "our",
  "all",
  "have",
  "has",
  "had",
  "not",
  "but",
  "out",
  "job",
  "role",
  "team",
  "work",
  "years",
  "year",
  "experience",
  "senior",
  "lead",
  "frontend",
  "engineer",
]);

function extractRelevantKeywords(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9+#./-]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));

  return Array.from(new Set(tokens)).slice(0, 40);
}

function countKeywordHits(haystack: string, keywords: string[]): number {
  const normalized = haystack.toLowerCase();
  return keywords.reduce(
    (score, keyword) => score + (normalized.includes(keyword) ? 1 : 0),
    0,
  );
}

function selectRelevantDescriptionBullets(
  bullets: string[],
  keywords: string[],
  limit: number,
): string[] {
  const ranked = bullets
    .map((bullet) => ({
      bullet,
      score: countKeywordHits(bullet, keywords),
    }))
    .sort((a, b) => b.score - a.score || b.bullet.length - a.bullet.length);

  const selected = ranked.slice(0, limit).map((item) => item.bullet);
  return selected.length > 0 ? selected : bullets.slice(0, limit);
}

function compressWorkExperience(
  items: WorkExperience[],
  keywords: string[],
  limit: number,
): WorkExperience[] {
  const ranked = items
    .map((item) => {
      const combined = [
        item.title,
        item.company,
        item.location,
        item.mainDescription,
        ...(item.description || []),
      ]
        .filter(Boolean)
        .join(" ");

      return {
        item,
        score: countKeywordHits(combined, keywords),
      };
    })
    .sort((a, b) => b.score - a.score);

  const selected = ranked
    .slice(0, limit)
    .map(({ item }) => ({
      ...item,
      description: selectRelevantDescriptionBullets(
        item.description || [],
        keywords,
        4,
      ),
    }))
    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

  return selected.length > 0 ? selected : items.slice(0, limit);
}

function compressSkills(
  items: Skill[],
  keywords: string[],
  limit: number,
): Skill[] {
  const alwaysKeep = items.filter(
    (item) => item.category === "soft" || item.category === "language",
  );

  const rankedTechnical = items
    .filter((item) => item.category === "technical")
    .map((item) => ({
      item,
      score: countKeywordHits(
        `${item.name} ${item.category} ${item.level || ""}`,
        keywords,
      ),
    }))
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));

  const technicalLimit = Math.max(limit - alwaysKeep.length, 0);
  const selectedTechnical = rankedTechnical
    .slice(0, technicalLimit)
    .map((entry) => entry.item);

  const selected = [...alwaysKeep, ...selectedTechnical];
  return selected.length > 0 ? selected : items.slice(0, limit);
}

function compressEducation(items: Education[], limit: number): Education[] {
  return items.slice(0, limit);
}

function buildRelevantProfileData(
  profileData: {
    personalInfo: any;
    workExperience: WorkExperience[];
    education: Education[];
    skills: Skill[];
  },
  jobDescription: string,
  mode: "cover-letter" | "resume",
) {
  const keywords = extractRelevantKeywords(jobDescription);
  const workExperienceLimit = mode === "resume" ? 5 : 4;
  const skillLimit = mode === "resume" ? 12 : 8;

  return {
    personalInfo: {
      ...profileData.personalInfo,
      summary: profileData.personalInfo?.summary || "",
      location: profileData.personalInfo?.location || "",
      phone: profileData.personalInfo?.phone || "",
      website: profileData.personalInfo?.website || "",
      linkedin: profileData.personalInfo?.linkedin || "",
      github: profileData.personalInfo?.github || "",
      telegram: profileData.personalInfo?.telegram || "",
    },
    workExperience: compressWorkExperience(
      profileData.workExperience || [],
      keywords,
      workExperienceLimit,
    ),
    education: compressEducation(profileData.education || [], 2),
    skills: compressSkills(profileData.skills || [], keywords, skillLimit),
  };
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeResumePayload(
  resumeJson: any,
  sourceProfile: {
    personalInfo: any;
    workExperience: WorkExperience[];
    education: Education[];
    skills: Skill[];
  },
) {
  const sourcePersonalInfo = sourceProfile.personalInfo ?? {};
  const sourceSkills = sourceProfile.skills ?? [];
  const sourceSoftAndLanguageSkills = sourceSkills.filter(
    (skill) => skill.category === "soft" || skill.category === "language",
  );
  const sourceSkillNames = new Set(
    sourceSkills.map((skill) => skill.name.trim().toLowerCase()).filter(Boolean),
  );

  const normalizedSkills = Array.isArray(resumeJson?.skills)
    ? resumeJson.skills
        .map((skill: any, index: number) => ({
          id: skill?.id || crypto.randomUUID(),
          name: normalizeString(skill?.name),
          category:
            skill?.category === "soft" || skill?.category === "language"
              ? skill.category
              : "technical",
          level: normalizeString(skill?.level) || "advanced",
        }))
        .filter(
          (skill: Skill, index: number, arr: Skill[]) =>
            skill.name &&
            sourceSkillNames.has(skill.name.toLowerCase()) &&
            arr.findIndex(
              (candidate) =>
                candidate.name.toLowerCase() === skill.name.toLowerCase(),
            ) === index,
        )
    : [];

  const mergedSkillsMap = new Map<string, Skill>();

  for (const skill of normalizedSkills) {
    mergedSkillsMap.set(skill.name.toLowerCase(), skill);
  }

  for (const skill of sourceSoftAndLanguageSkills) {
    const key = skill.name.toLowerCase();
    if (!mergedSkillsMap.has(key)) {
      mergedSkillsMap.set(key, {
        ...skill,
        id: skill.id || crypto.randomUUID(),
      });
    }
  }

  const fallbackSkills =
    mergedSkillsMap.size > 0
      ? Array.from(mergedSkillsMap.values())
      : sourceSkills.slice(0, 16).map((skill) => ({
          ...skill,
          id: skill.id || crypto.randomUUID(),
        }));

  return {
    personalInfo: {
      firstName: normalizeString(resumeJson?.personalInfo?.firstName) || normalizeString(sourcePersonalInfo.firstName),
      lastName: normalizeString(resumeJson?.personalInfo?.lastName) || normalizeString(sourcePersonalInfo.lastName),
      email: normalizeString(resumeJson?.personalInfo?.email) || normalizeString(sourcePersonalInfo.email),
      phone: sourcePersonalInfo?.phone ? normalizeString(resumeJson?.personalInfo?.phone) : "",
      location: sourcePersonalInfo?.location
        ? normalizeString(resumeJson?.personalInfo?.location)
        : "",
      website: sourcePersonalInfo?.website
        ? normalizeString(resumeJson?.personalInfo?.website)
        : "",
      linkedin: sourcePersonalInfo?.linkedin
        ? normalizeString(resumeJson?.personalInfo?.linkedin)
        : "",
      github: sourcePersonalInfo?.github
        ? normalizeString(resumeJson?.personalInfo?.github)
        : "",
      telegram: sourcePersonalInfo?.telegram
        ? normalizeString(resumeJson?.personalInfo?.telegram)
        : "",
      summary: normalizeString(resumeJson?.personalInfo?.summary),
    },
    workExperience: Array.isArray(resumeJson?.workExperience)
      ? resumeJson.workExperience.map((item: any) => ({
          id: item?.id || crypto.randomUUID(),
          title: normalizeString(item?.title),
          company: normalizeString(item?.company),
          location: normalizeString(item?.location),
          startDate: normalizeString(item?.startDate),
          endDate: normalizeString(item?.endDate),
          current: Boolean(item?.current),
          description: Array.isArray(item?.description)
            ? item.description.map(normalizeString).filter(Boolean)
            : [],
          employmentType: normalizeString(item?.employmentType) || undefined,
        }))
      : [],
    education: Array.isArray(resumeJson?.education)
      ? resumeJson.education.map((item: any) => ({
          id: item?.id || crypto.randomUUID(),
          institution: normalizeString(item?.institution),
          degree: normalizeString(item?.degree),
          field: normalizeString(item?.field),
          startDate: normalizeString(item?.startDate),
          endDate: normalizeString(item?.endDate),
          current: Boolean(item?.current),
        }))
      : [],
    skills: fallbackSkills,
    detectedLanguage: normalizeString(resumeJson?.detectedLanguage) || "en",
    targetPosition: normalizeString(resumeJson?.targetPosition) || null,
    targetCompany: normalizeString(resumeJson?.targetCompany) || null,
    certificates: Array.isArray(resumeJson?.certificates)
      ? resumeJson.certificates
      : [],
  };
}

async function extractJobEssentials(
  rawDescription: string,
  userId: string,
): Promise<string> {
  const startedAt = Date.now();
  const systemPrompt = `Extract only essential JD data in compact plain text.
Keep only:
- company
- title
- top skills/technologies
- top requirements
- top responsibilities
Remove benefits, mission, culture, EEO, and application fluff.
Use short bullet points.`;

  const userPrompt = `Job Description to process:\n\n${rawDescription}`;

  try {
    const response = await aiComplete(
      {
        // Neutral alias. server-ai maps this to a provider-safe small/fast chat model.
        model: "small-fast",
        systemPrompt,
        userPrompt,
        temperature: 0.1, // Низкая температура для точности
        maxTokens: 1000,
        timeoutMs: 45000,
      },
      userId,
    );

    console.log(
      `[cover-letter] Stage extract-job-essentials done in ${Date.now() - startedAt}ms`,
    );
    console.log("Extracted job essentials:", response.content.trim());
    return response.content.trim();
  } catch (error) {
    console.error(
      "Failed to extract job essentials, using raw description",
      error,
    );
    return rawDescription.substring(0, 4000); // Fallback на обрезку текста
  }
}

export async function POST(request: Request) {
  try {
    const requestStartedAt = Date.now();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      jobDescription,
      language,
      format = "prose",
      generateResume = false,
      resumeLanguage = "en",
      profile: clientProfile,
    } = await request.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 },
      );
    }

    const essentialJobInfo = await extractJobEssentials(
      jobDescription,
      session.user.id,
    );

    const safeJobDescription = essentialJobInfo;
    console.log(
      `[cover-letter] Stage extract-job-essentials complete, request +${Date.now() - requestStartedAt}ms`,
    );

    // Safety truncation for extremely long inputs (10k chars is approx 2.5k tokens)
    // This allows for long JDs while still staying within a 12k TPM bucket when maxTokens and profile are added.
    // const safeJobDescription =
    //   jobDescription.length > 10000
    //     ? jobDescription.substring(0, 10000) + "... [Truncated for brevity]"
    //     : jobDescription;

    // Check resume limit if tailoring is requested
    if (generateResume) {
      const resumeCount = await prisma.resume.count({
        where: { userId: session.user.id },
      });

      if (resumeCount >= 2) {
        return NextResponse.json(
          {
            error:
              "Resume limit reached. Please delete an existing resume to generate a new tailored version.",
          },
          { status: 403 },
        );
      }
    }

    // Use profile from client store if provided, else fetch from DB
    let profile = clientProfile;
    if (!profile?.personalInfo && !profile?.workExperience?.length) {
      const dbProfile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      });
      profile = dbProfile;
    }

    if (!profile) {
      return NextResponse.json(
        { error: "No profile found. Please add your experience first." },
        { status: 400 },
      );
    }

    // Encode profile data as TOON for token efficiency
    const profileData = {
      personalInfo: profile.personalInfo ?? {},
      workExperience: profile.workExperience ?? [],
      education: profile.education ?? [],
      skills: profile.skills ?? [],
    };
    const coverLetterProfile = buildRelevantProfileData(
      profileData,
      safeJobDescription,
      "cover-letter",
    );
    const profileToon = encode(coverLetterProfile);

    const systemPrompt = getCoverLetterSystemPrompt(
      format === "bullet" ? "bullet" : "prose",
    );
    const userPrompt = buildCoverLetterUserPrompt({
      jobDescription: safeJobDescription,
      profileToon,
    });

    const response = await aiComplete(
      {
        systemPrompt,
        userPrompt,
        temperature: 0.3,
        // A concise cover letter should comfortably fit below this ceiling.
        maxTokens: 700,
        timeoutMs: 60000,
      },
      session.user.id,
    );
    console.log(
      `[cover-letter] Stage generate-cover-letter complete, request +${Date.now() - requestStartedAt}ms`,
    );

    const result: {
      success: boolean;
      coverLetter: string;
      resumeId?: string;
      coverLetterId?: string;
    } = {
      success: true,
      coverLetter: response.content.trim(),
    };

    // Generate tailored resume if requested
    if (generateResume) {
      const resumeUserPrompt = buildTailoredResumeUserPrompt({
        jobDescription: safeJobDescription,
        profileToon: encode(
          buildRelevantProfileData(profileData, safeJobDescription, "resume"),
        ),
        resumeLanguage,
      });

      const resumeResponse = await executeStructuredAI<any>(
        {
          systemPrompt: getTailoredResumeSystemPrompt(),
          userPrompt: resumeUserPrompt,
          temperature: 0.3,
          // Input is pre-compressed and IDs are server-generated, so the JSON
          // output can stay significantly smaller than before.
          maxTokens: 3000,
          timeoutMs: 90000,
        },
        session.user.id,
      );
      console.log(
        `[cover-letter] Stage generate-tailored-resume complete, request +${Date.now() - requestStartedAt}ms`,
      );

      const resumeJson = normalizeResumePayload(resumeResponse.parsed, profileData);

      const firstLine = jobDescription.trim().split("\n")[0].slice(0, 80);
      const resumeTitle = `Tailored: ${firstLine}`;

      const savedResume = await (prisma.resume.create as any)({
        data: {
          title: resumeTitle,
          template: "professional",
          language: resumeJson.detectedLanguage || "en",
          personalInfo: resumeJson.personalInfo || {},
          workExperience: resumeJson.workExperience || [],
          education: resumeJson.education || [],
          skills: resumeJson.skills || [],
          certificates: resumeJson.certificates || [],
          targetPosition: resumeJson.targetPosition || null,
          targetCompany: resumeJson.targetCompany || null,
          userId: session.user.id,
        },
      });

      result.resumeId = savedResume.id;
    }

    // Save cover letter to DB (enforce 2-record limit)
    const existingCount = await prisma.coverLetter.count({
      where: { userId: session.user.id },
    });

    if (existingCount >= 2) {
      const oldest = await prisma.coverLetter.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
      });
      if (oldest) {
        await prisma.coverLetter.delete({ where: { id: oldest.id } });
      }
    }

    const savedCoverLetter = await prisma.coverLetter.create({
      data: {
        jobDescription,
        coverLetterText: result.coverLetter,
        format,
        language: language || "en",
        userId: session.user.id,
        resumeId: result.resumeId || null,
      },
    });

    result.coverLetterId = savedCoverLetter.id;
    console.log(
      `[cover-letter] Request complete in ${Date.now() - requestStartedAt}ms`,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating cover letter:", error);
    const message =
      error instanceof Error ? error.message : "Error generating cover letter";

    if (
      message.includes("temporarily unavailable") ||
      message.includes("high demand") ||
      message.includes("rate-limited")
    ) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
