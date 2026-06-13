import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Resume, WorkExperience } from "@/types/resume";
import type { JobMatch } from "@/types/job-match";
import {
  buildJobMatchSystemPrompt,
  buildJobMatchUserPrompt,
} from "@/lib/ai/prompts/job-match";
import { executeStructuredAI } from "@/lib/ai/structured-output";

function formatResumeForJobMatch(resume: Partial<Resume>): string {
  const parts: string[] = [];

  if (resume.personalInfo) {
    const pi = resume.personalInfo;
    parts.push(`Name: ${pi.firstName} ${pi.lastName}`);
    if (pi.summary) parts.push(`Summary: ${pi.summary}`);
  }

  if (resume.workExperience?.length) {
    parts.push("\n== WORK EXPERIENCE ==");
    resume.workExperience.forEach((exp: WorkExperience) => {
      parts.push(`\n${exp.title} at ${exp.company} (${exp.startDate} – ${exp.current ? "Present" : exp.endDate || ""})`);
      if (exp.mainDescription) parts.push(exp.mainDescription);
      exp.description?.forEach((d) => d && parts.push(`• ${d}`));
    });
  }

  if (resume.education?.length) {
    parts.push("\n== EDUCATION ==");
    resume.education.forEach((edu) => {
      parts.push(`${edu.degree} in ${edu.field} — ${edu.institution}`);
    });
  }

  if (resume.skills?.length) {
    parts.push("\n== SKILLS ==");
    const technical = resume.skills.filter((s) => s.category === "technical").map((s) => s.name);
    const soft = resume.skills.filter((s) => s.category === "soft").map((s) => s.name);
    const langs = resume.skills.filter((s) => s.category === "language").map((s) => s.name);
    if (technical.length) parts.push(`Technical: ${technical.join(", ")}`);
    if (soft.length) parts.push(`Soft skills: ${soft.join(", ")}`);
    if (langs.length) parts.push(`Languages: ${langs.join(", ")}`);
  }

  return parts.join("\n");
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, jobDescription, language = "en" } = await req.json();

    if (!resumeId || !jobDescription?.trim()) {
      return NextResponse.json({ error: "resumeId and jobDescription are required" }, { status: 400 });
    }

    if (jobDescription.trim().length < 50) {
      return NextResponse.json({ error: "Job description is too short" }, { status: 400 });
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const languageNames: Record<string, string> = {
      en: "English",
      uk: "Ukrainian",
      ru: "Russian",
    };

    const formattedResume = formatResumeForJobMatch(resume as unknown as Partial<Resume>);

    const aiResponse = await executeStructuredAI<JobMatch>(
      {
        systemPrompt: buildJobMatchSystemPrompt(),
        userPrompt: buildJobMatchUserPrompt({
          formattedResume,
          jobDescription: jobDescription.trim(),
          language: languageNames[language] || "English",
        }),
        temperature: 0.2,
        maxTokens: 2000,
      },
      session.user.id,
    );

    return NextResponse.json(aiResponse.parsed);
  } catch (err: unknown) {
    console.error("[Job Match API error]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
