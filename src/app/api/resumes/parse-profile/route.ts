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

// --- Token estimation & chunking utilities ---

/** Rough token estimate: ~3.5 chars per token for English, ~2.5 for mixed/Cyrillic */
function estimateTokens(text: string): number {
  const nonAsciiRatio =
    (text.match(/[^\x00-\x7F]/g)?.length ?? 0) / (text.length || 1);
  const charsPerToken = nonAsciiRatio > 0.3 ? 2.5 : 3.5;
  return Math.ceil(text.length / charsPerToken);
}

/**
 * Split text into chunks on paragraph / section boundaries.
 * Each chunk stays under `maxTokens` (estimated).
 */
function splitTextIntoChunks(text: string, maxTokens: number): string[] {
  const totalTokens = estimateTokens(text);
  if (totalTokens <= maxTokens) return [text];

  // Split on double-newlines first (paragraph boundaries)
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    const candidateChunk = currentChunk ? currentChunk + "\n\n" + para : para;
    if (estimateTokens(candidateChunk) > maxTokens && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk = candidateChunk;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // Safety: if a single paragraph is huge, force-split by characters
  const result: string[] = [];
  for (const chunk of chunks) {
    if (estimateTokens(chunk) <= maxTokens) {
      result.push(chunk);
    } else {
      const approxCharsPerChunk = maxTokens * 3;
      for (let i = 0; i < chunk.length; i += approxCharsPerChunk) {
        result.push(chunk.slice(i, i + approxCharsPerChunk).trim());
      }
    }
  }

  return result.filter(Boolean);
}

// Groq free-tier TPM limit is 12,000 tokens (input + output combined).
// System prompt is ~400 tokens, user prompt wrapper ~20 tokens.
// Reserve 2048 for response + 500 safety margin.
const GROQ_TPM_LIMIT = 12000;
const RESPONSE_TOKEN_RESERVE = 2048;
const SAFETY_MARGIN = 500;

// --- Server-side merge utilities ---

const safeStr = (val: any) => (typeof val === "string" ? val : "");

/** Merge parsed personalInfo with existing, preferring new non-empty values */
function mergePersonalInfo(existing: any, parsed: any): any {
  const fields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "location",
    "summary",
    "linkedin",
    "telegram",
  ];
  const result: any = {};
  for (const field of fields) {
    const newVal = safeStr(parsed?.[field]);
    const oldVal = safeStr(existing?.[field]);
    result[field] = newVal || oldVal;
  }
  return result;
}

/** Deduplicate work experience by company+title (case-insensitive) */
function mergeWorkExperience(existing: any[], parsed: any[]): any[] {
  const normalize = (exp: any) => ({
    id: exp.id || crypto.randomUUID(),
    title: exp.title || "Position",
    company: exp.company || "Company",
    location: exp.location || "",
    startDate: exp.startDate || "",
    endDate: exp.endDate || "",
    current: !!exp.current,
    mainDescription: safeStr(exp.mainDescription),
    description: Array.isArray(exp.description)
      ? exp.description
      : [safeStr(exp.description)],
  });

  const key = (exp: any) =>
    `${(exp.company || "").toLowerCase()}::${(exp.title || "").toLowerCase()}`;

  const seen = new Map<string, any>();
  for (const exp of existing) {
    seen.set(key(exp), normalize(exp));
  }
  for (const exp of parsed) {
    const k = key(exp);
    if (!seen.has(k)) {
      seen.set(k, normalize(exp));
    } else {
      // Prefer the version with more description items
      const old = seen.get(k)!;
      const newNorm = normalize(exp);
      if (
        newNorm.description.length > old.description.length ||
        (newNorm.mainDescription && !old.mainDescription)
      ) {
        seen.set(k, { ...newNorm, id: old.id });
      }
    }
  }
  return Array.from(seen.values());
}

/** Deduplicate education by institution+degree (case-insensitive) */
function mergeEducation(existing: any[], parsed: any[]): any[] {
  const normalize = (edu: any) => ({
    id: edu.id || crypto.randomUUID(),
    institution: edu.institution || "Institution",
    degree: edu.degree || "",
    field: edu.field || "",
    startDate: edu.startDate || "",
    endDate: edu.endDate || "",
    current: !!edu.current,
  });

  const key = (edu: any) =>
    `${(edu.institution || "").toLowerCase()}::${(edu.degree || "").toLowerCase()}`;

  const seen = new Map<string, any>();
  for (const edu of existing) {
    seen.set(key(edu), normalize(edu));
  }
  for (const edu of parsed) {
    const k = key(edu);
    if (!seen.has(k)) {
      seen.set(k, normalize(edu));
    }
  }
  return Array.from(seen.values());
}

const normalizeLevel = (level: string): string => {
  const l = (level || "").toLowerCase();
  if (l.includes("native") || l.includes("bilingual")) return "native";
  if (l.includes("full professional") || l.includes("fluent")) return "fluent";
  if (l.includes("professional working") || l.includes("proficient"))
    return "proficient";
  if (l.includes("limited working")) return "elementary";
  if (l.includes("elementary")) return "elementary";
  if (l.includes("beginner")) return "beginner";
  if (l.includes("advanced")) return "advanced";
  if (l.includes("intermediate")) {
    if (l.includes("upper")) return "upper-intermediate";
    if (l.includes("pre")) return "pre-intermediate";
    return "intermediate";
  }
  if (l.includes("expert")) return "expert";
  return level || "advanced";
};

/** Deduplicate skills by name (case-insensitive) */
function mergeSkills(existing: any[], parsed: any[]): any[] {
  const normalize = (skill: any) => ({
    id: skill.id || crypto.randomUUID(),
    name: typeof skill === "string" ? skill : skill.name,
    category: skill.category || "technical",
    level: normalizeLevel(typeof skill === "string" ? "" : skill.level),
  });

  const seen = new Map<string, any>();
  for (const skill of existing) {
    const n = normalize(skill);
    seen.set((n.name || "").toLowerCase(), n);
  }
  for (const skill of parsed) {
    const n = normalize(skill);
    const k = (n.name || "").toLowerCase();
    if (!seen.has(k)) {
      seen.set(k, n);
    }
  }
  return Array.from(seen.values());
}

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

    const cleanText = (input: string) => {
      let text = input;
      text = text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "");

      // Fix spaced out text "S e n i o r" -> "Senior"
      const spacingPattern = /(?:[A-Za-z]\s{1,2}){2,}[A-Za-z]/g;
      text = text.replace(spacingPattern, (match) => match.replace(/\s+/g, ""));

      return text
        .replace(/[•●▪◦▸►→✓✔]/g, "-")
        .replace(/[^\S\n]{3,}/g, "  ")
        .replace(/\n{4,}/g, "\n\n")
        .trim();
    };

    const normalizedText = cleanText(text);

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
      existingProfile?.personalInfo || {},
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

    return NextResponse.json({ success: true, message: "Profile updated" });
  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
