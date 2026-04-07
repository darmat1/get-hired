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

async function extractJobEssentials(
  rawDescription: string,
  userId: string,
): Promise<string> {
  const systemPrompt = `You are an expert HR assistant. Your task is to extract only the essential information from a job description. 
Extract:
1. Company Name (if mentioned)
2. Job Title
3. Key Skills and Technologies
4. Core Requirements, Expectations and Qualifications
5. Responsibilities

Strictly remove all "fluff" such as company benefits, mission statements, equal opportunity notices, or application instructions. 
Provide the output in a concise, structured text format.`;

  const userPrompt = `Job Description to process:\n\n${rawDescription}`;

  try {
    const response = await aiComplete(
      {
        // Указываем модель 8b. Если aiComplete не принимает модель,
        // проверьте её код, возможно нужно добавить этот параметр.
        model: "llama-3.1-8b-instant",
        systemPrompt,
        userPrompt,
        temperature: 0.1, // Низкая температура для точности
        maxTokens: 1000,
      },
      userId,
    );

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
    const profileToon = encode(profileData);

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
        // Reduced from 8000 to 2000 to avoid Groq 413 Rate Limit errors.
        // A typical cover letter never exceeds 1000 tokens.
        maxTokens: 1000,
      },
      session.user.id,
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
        profileToon,
        resumeLanguage,
      });

      const resumeResponse = await executeStructuredAI<any>(
        {
          systemPrompt: getTailoredResumeSystemPrompt(),
          userPrompt: resumeUserPrompt,
          temperature: 0.3,
          // Reduced from 12000 to 4000 to avoid Groq 413 Rate Limit errors.
          // Structured resumes rarely exceed 2000 tokens.
          maxTokens: 2500,
        },
        session.user.id,
      );

      let resumeJson;
      try {
        resumeJson = resumeResponse.parsed;
      } catch (err) {
        console.error(
          "Failed to parse AI resume JSON:",
          resumeResponse.raw.content,
        );
        return NextResponse.json(
          { error: "Failed to generate structured resume. Please try again." },
          { status: 500 },
        );
      }

      const firstLine = jobDescription.trim().split("\n")[0].slice(0, 80);
      const resumeTitle = `Tailored: ${firstLine}`;

      const savedResume = await (prisma.resume.create as any)({
        data: {
          title: resumeTitle,
          template: "modern",
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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { error: "Error generating cover letter" },
      { status: 500 },
    );
  }
}
