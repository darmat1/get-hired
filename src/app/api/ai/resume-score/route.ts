import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { aiComplete } from "@/lib/ai/server-ai";
import { RESUME_SCORE_PROMPT } from "@/lib/ai/resume-score-prompt";
import type { Resume, WorkExperience } from "@/types/resume";
import type { ResumeScore, CompanyScore } from "@/types/resume-score";

function formatResumeForAnalysis(
  resume: Partial<Resume>,
  targetRole?: string,
): string {
  const parts: string[] = [];

  if (resume.personalInfo) {
    parts.push("=== PERSONAL INFO ===");
    parts.push(`Name: ${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`);
    parts.push(`Email: ${resume.personalInfo.email || "NOT PROVIDED"}`);
    parts.push(`Phone: ${resume.personalInfo.phone || "NOT PROVIDED"}`);
    parts.push(`Location: ${resume.personalInfo.location || "NOT PROVIDED"}`);
    parts.push(`LinkedIn: ${resume.personalInfo.linkedin || "NOT PROVIDED"}`);
    parts.push(`Website: ${resume.personalInfo.website || "NOT PROVIDED"}`);
    parts.push(`Summary: ${resume.personalInfo.summary || "EMPTY"}`);
  }

  if (resume.workExperience && resume.workExperience.length > 0) {
    parts.push("\n=== WORK EXPERIENCE ===");
    resume.workExperience.forEach((exp: WorkExperience, index: number) => {
      parts.push(`\n--- Position ${index + 1} ---`);
      parts.push(`Title: ${exp.title}`);
      parts.push(`Company: ${exp.company}`);
      parts.push(`Location: ${exp.location || "NOT PROVIDED"}`);
      parts.push(`Employment Type: ${exp.employmentType || "NOT PROVIDED"}`);
      parts.push(`Period: ${exp.startDate} - ${exp.current ? "Present" : exp.endDate || "NOT PROVIDED"}`);
      parts.push(`Main Description: ${exp.mainDescription || "EMPTY"}`);
      if (exp.description && exp.description.length > 0) {
        parts.push("Description Points:");
        exp.description.forEach((desc: string, i: number) => {
          parts.push(`  ${i + 1}. ${desc || "EMPTY"}`);
        });
      }
    });
  }

  if (resume.education && resume.education.length > 0) {
    parts.push("\n=== EDUCATION ===");
    resume.education.forEach((edu, index: number) => {
      parts.push(`\n--- Education ${index + 1} ---`);
      parts.push(`Institution: ${edu.institution}`);
      parts.push(`Degree: ${edu.degree}`);
      parts.push(`Field: ${edu.field || "NOT PROVIDED"}`);
      parts.push(`Period: ${edu.startDate} - ${edu.current ? "Present" : edu.endDate || "NOT PROVIDED"}`);
      parts.push(`GPA: ${edu.gpa || "NOT PROVIDED"}`);
    });
  }

  if (resume.skills && resume.skills.length > 0) {
    parts.push("\n=== SKILLS ===");
    const technical = resume.skills.filter((s) => s.category === "technical");
    const soft = resume.skills.filter((s) => s.category === "soft");
    const langSkills = resume.skills.filter((s) => s.category === "language");
    if (technical.length > 0) {
      parts.push(`Technical: ${technical.map((s) => s.name).join(", ")}`);
    }
    if (soft.length > 0) {
      parts.push(`Soft: ${soft.map((s) => s.name).join(", ")}`);
    }
    if (langSkills.length > 0) {
      parts.push(`Languages: ${langSkills.map((s) => s.name).join(", ")}`);
    }
  }

  if (targetRole) {
    parts.push(`\n=== TARGET ROLE ===`);
    parts.push(targetRole);
  }

  return parts.join("\n");
}

function formatCompanyForAnalysis(
  experience: WorkExperience,
  targetRole?: string,
): string {
  const parts: string[] = [];

  parts.push("=== COMPANY EXPERIENCE ===");
  parts.push(`Title: ${experience.title}`);
  parts.push(`Company: ${experience.company}`);
  parts.push(`Location: ${experience.location || "NOT PROVIDED"}`);
  parts.push(`Employment Type: ${experience.employmentType || "NOT PROVIDED"}`);
  parts.push(`Period: ${experience.startDate} - ${experience.current ? "Present" : experience.endDate || "NOT PROVIDED"}`);
  parts.push(`Main Description: ${experience.mainDescription || "EMPTY"}`);
  if (experience.description && experience.description.length > 0) {
    parts.push("Description Points:");
    experience.description.forEach((desc: string, i: number) => {
      parts.push(`  ${i + 1}. ${desc || "EMPTY"}`);
    });
  }

  if (targetRole) {
    parts.push(`\n=== TARGET ROLE ===`);
    parts.push(targetRole);
  }

  return parts.join("\n");
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const { type, resume, experience, targetRole, language = "en" } = payload;

    const languageNames: Record<string, string> = {
      en: "English",
      uk: "Ukrainian",
      ru: "Russian",
    };
    const targetLanguage = languageNames[language] || "English";

    if (type === "resume") {
      const resumeData = resume as Partial<Resume>;
      const formattedResume = formatResumeForAnalysis(resumeData, targetRole);
      const currentDate = new Date().toISOString().split("T")[0];
      const currentYear = new Date().getFullYear();

      const prompt = `${RESUME_SCORE_PROMPT}

### IMPORTANT CONTEXT
- Current date: ${currentDate}
- Current year: ${currentYear}
- Use this to validate employment dates. A start date in the future (${currentYear + 1} or later) or beyond current date is INVALID.
- Respond in ${targetLanguage} language.

Resume to analyze:
${formattedResume}`;

      const aiResponse = await aiComplete(
        {
          systemPrompt: "You are an expert resume analyst. Return ONLY valid JSON, no other text, no markdown code blocks, no explanations. The output must be parseable by JSON.parse().",
          userPrompt: prompt,
          temperature: 0.2,
          maxTokens: 8000,
          responseFormat: { type: "json_object" },
        },
        session.user.id,
      );

      let score: ResumeScore;
      try {
        console.log("[Resume Score] Raw AI response:", aiResponse.content);
        score = JSON.parse(aiResponse.content) as ResumeScore;
      } catch (err) {
        console.error("[Resume Score] Failed to parse JSON:", err);
        console.error("[Resume Score] Response content:", aiResponse.content);
        return NextResponse.json(
          { error: "Failed to parse AI response", rawResponse: aiResponse.content.substring(0, 200) },
          { status: 500 },
        );
      }

      return NextResponse.json(score);
    } else if (type === "company") {
      const experienceData = experience as WorkExperience;
      const formattedExperience = formatCompanyForAnalysis(experienceData, targetRole);
      const currentDate = new Date().toISOString().split("T")[0];
      const currentYear = new Date().getFullYear();

      const companyPrompt = `You are an expert recruiter analyzing a single work experience entry. Analyze this experience and return ONLY valid JSON.

### IMPORTANT CONTEXT
- Current date: ${currentDate}
- Current year: ${currentYear}
- Use this to validate employment dates. A start date in the future (${currentYear + 1} or later) or beyond current date is INVALID.
- Respond in ${targetLanguage} language.

### SEVERITY LEVELS

RED — major issues:
- Job title has zero relevance to target role
- Dates are impossible (e.g., start date in the future)
- No description provided
- Spelling errors in job title or company name

YELLOW — concerns:
- Description is too brief or generic
- No measurable achievements (no numbers, percentages)
- Duties listed instead of achievements
- Short tenure (< 6 months) without explanation
- Description mentions technologies not in target role

GREEN — strengths:
- Has specific measurable achievements with numbers/percentages
- Clear career progression or increased responsibility
- Relevant technologies and methodologies mentioned
- Demonstrates impact with concrete results

### OUTPUT FORMAT
{
  "score": 0-100,
  "scoreLabel": "Weak | Fair | Good | Strong | Excellent",
  "summary": "2 sentence assessment",
  "red": [{"field": "...", "issue": "...", "recommendation": "..."}],
  "yellow": [{"field": "...", "issue": "...", "recommendation": "..."}],
  "green": [{"field": "...", "strength": "..."}]
}

Scoring: Start at 100, -15 per RED, -5 per YELLOW, +2 per GREEN (max +10).

Experience to analyze:
${formattedExperience}`;

      const aiResponse = await aiComplete(
        {
          systemPrompt: "You are an expert resume analyst. Return ONLY valid JSON, no other text, no markdown code blocks, no explanations. The output must be parseable by JSON.parse().",
          userPrompt: companyPrompt,
          temperature: 0.2,
          maxTokens: 8000,
          responseFormat: { type: "json_object" },
        },
        session.user.id,
      );

      let score: CompanyScore;
      try {
        console.log("[Resume Score] Raw AI response:", aiResponse.content);
        score = JSON.parse(aiResponse.content) as CompanyScore;
      } catch (err) {
        console.error("[Resume Score] Failed to parse JSON:", err);
        console.error("[Resume Score] Response content:", aiResponse.content);
        return NextResponse.json(
          { error: "Failed to parse AI response", rawResponse: aiResponse.content.substring(0, 200) },
          { status: 500 },
        );
      }

      return NextResponse.json(score);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    console.error("[Resume Score API error]:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
