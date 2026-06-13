import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { aiComplete } from "@/lib/ai/server-ai";
import {
  buildProfileParseSystemPrompt,
  buildProfileParseUserPrompt,
} from "@/lib/ai/prompts/profile-parse";
import { parseAIJsonResponse } from "@/lib/ai/parse-json-response";
import {
  estimateTokens,
  splitTextIntoChunks,
  cleanResumeText,
  mergePersonalInfo,
  mergeWorkExperience,
  mergeEducation,
  mergeSkills,
} from "@/lib/profile-parse-utils";

// Groq free-tier TPM limit is 12,000 tokens (input + output combined).
// System prompt is ~400 tokens, user prompt wrapper ~20 tokens.
// Reserve 2048 for response + 500 safety margin.
const GROQ_TPM_LIMIT = 12000;
const RESPONSE_TOKEN_RESERVE = 2048;
const SAFETY_MARGIN = 500;

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Profile text is required" },
        { status: 400 },
      );
    }

    const normalizedText = cleanResumeText(text);

    const systemPrompt = buildProfileParseSystemPrompt();

    const parseAIResponse = (content: string): any => {
      if (!content) throw new Error("Empty AI Content");
      try {
        return parseAIJsonResponse(content);
      } catch (e) {
        const cleaned = content
          .trim()
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/```\s*$/, "");
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");
        if (firstBrace === -1 || lastBrace === -1) {
          throw new Error("AI response did not contain valid JSON");
        }
        const jsonString = cleaned.substring(firstBrace, lastBrace + 1);
        const fixed = jsonString.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
        return JSON.parse(fixed);
      }
    };

    // --- Compute available token budget for user text ---
    const systemPromptTokens = estimateTokens(systemPrompt);
    // No existing profile in prompt anymore — budget is much larger
    const overhead = systemPromptTokens + RESPONSE_TOKEN_RESERVE + SAFETY_MARGIN;
    const availableForText = Math.max(1000, GROQ_TPM_LIMIT - overhead);

    console.log(
      `[AI] Token budget: system=${systemPromptTokens}, ` +
      `response=${RESPONSE_TOKEN_RESERVE}, available_for_text=${availableForText}, ` +
      `text_estimated=${estimateTokens(normalizedText)}`,
    );

    // --- Chunked processing ---
    const textChunks = splitTextIntoChunks(normalizedText, availableForText);
    const isChunked = textChunks.length > 1;

    if (isChunked) {
      console.log(
        `[AI] Profile parse: splitting into ${textChunks.length} chunks (budget ${availableForText} tok/chunk)`,
      );
    }

    // Parse each chunk and collect all partial results
    const allParsedChunks: any[] = [];

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];

      if (isChunked) {
        console.log(
          `[AI] Processing chunk ${i + 1}/${textChunks.length} (~${estimateTokens(chunk)} tokens)`,
        );
      }

      const userPrompt = buildProfileParseUserPrompt({
        normalizedText: chunk,
      });

      const response = await aiComplete(
        {
          systemPrompt,
          userPrompt,
          temperature: 0,
          maxTokens: RESPONSE_TOKEN_RESERVE,
          responseFormat: { type: "json_object" },
        },
        session.user.id,
      );

      allParsedChunks.push(parseAIResponse(response.content));
    }

    // --- Merge all AI chunks together (server-side) ---
    let mergedParsed: any = allParsedChunks[0] || {};

    for (let i = 1; i < allParsedChunks.length; i++) {
      const chunk = allParsedChunks[i];
      mergedParsed = {
        personalInfo: mergePersonalInfo(
          mergedParsed.personalInfo || {},
          chunk.personalInfo || {},
        ),
        workExperience: mergeWorkExperience(
          mergedParsed.workExperience || [],
          chunk.workExperience || [],
        ),
        education: mergeEducation(
          mergedParsed.education || [],
          chunk.education || [],
        ),
        skills: mergeSkills(
          mergedParsed.skills || [],
          chunk.skills || [],
        ),
      };
    }

    // --- Merge with existing DB profile (server-side) ---
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    let finalPersonalInfo = mergePersonalInfo(
      (existingProfile?.personalInfo as Record<string, unknown>) || {},
      mergedParsed.personalInfo || {},
    );

    // Fallback to session data if AI didn't find name/email
    if (!finalPersonalInfo.firstName && session.user.name) {
      const names = session.user.name.split(" ");
      finalPersonalInfo.firstName = names[0];
      if (names.length > 1) {
        finalPersonalInfo.lastName = names.slice(1).join(" ");
      }
    }
    if (!finalPersonalInfo.email && session.user.email) {
      finalPersonalInfo.email = session.user.email;
    }

    const existingWork = Array.isArray(existingProfile?.workExperience)
      ? (existingProfile.workExperience as any[])
      : [];
    const finalWorkExperience = mergeWorkExperience(
      existingWork,
      mergedParsed.workExperience || [],
    );

    const existingEdu = Array.isArray(existingProfile?.education)
      ? (existingProfile.education as any[])
      : [];
    const finalEducation = mergeEducation(
      existingEdu,
      mergedParsed.education || [],
    );

    const existingSkills = Array.isArray(existingProfile?.skills)
      ? (existingProfile.skills as any[])
      : [];
    const finalSkills = mergeSkills(
      existingSkills,
      mergedParsed.skills || [],
    );

    if (existingProfile) {
      await (prisma.userProfile.update as any)({
        where: { userId: session.user.id },
        data: {
          personalInfo: finalPersonalInfo,
          workExperience: finalWorkExperience,
          education: finalEducation,
          skills: finalSkills,
        },
      });
    } else {
      await (prisma.userProfile.create as any)({
        data: {
          userId: session.user.id,
          personalInfo: finalPersonalInfo,
          workExperience: finalWorkExperience,
          education: finalEducation,
          skills: finalSkills,
          certificates: [],
        },
      });
    }

    const newWorkCount = (mergedParsed.workExperience || []).length;
    const newEduCount = (mergedParsed.education || []).length;
    const newSkillsCount = (mergedParsed.skills || []).length;
    const nothingFound = newWorkCount === 0 && newEduCount === 0 && newSkillsCount === 0;

    return NextResponse.json({
      success: true,
      message: nothingFound ? "No data extracted from document" : "Profile updated",
      nothingFound,
      extracted: {
        workCount: newWorkCount,
        educationCount: newEduCount,
        skillsCount: newSkillsCount,
      },
    });
  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
