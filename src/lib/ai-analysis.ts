import { Resume } from "@/types/resume";
import { encode, decode } from "@toon-format/toon";
import { aiComplete, getAvailableProviders } from "@/lib/ai";

export interface AIAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  recommendations: {
    section: string;
    suggestion: string;
    priority: "high" | "medium" | "low";
  }[];
}

export interface ImprovementTip {
  type: "info" | "high" | "medium" | "low";
  message: string;
}

export async function analyzeResume(
  resume: Resume,
  language: string = "en",
): Promise<AIAnalysis> {
  // Try real AI if any provider is available
  if (getAvailableProviders().length > 0) {
    try {
      return await analyzeWithAI(resume, language);
    } catch (error) {
      console.warn("AI analysis failed, falling back to mock:", error);
    }
  }

  // Fallback to mock analysis

  const analysis: AIAnalysis = {
    score: calculateResumeScore(resume),
    strengths: [],
    weaknesses: [],
    suggestions: [],
    recommendations: [],
  };

  // Analyze personal info
  if (resume.personalInfo.summary && resume.personalInfo.summary.length > 100) {
    analysis.strengths.push("ai_analysis.summary_good");
  } else {
    analysis.weaknesses.push("ai_analysis.summary_missing");
    analysis.recommendations.push({
      section: "form.personal_info",
      suggestion: "ai_analysis.summary_recommendation",
      priority: "high",
    });
  }

  // Analyze work experience
  if (resume.workExperience.length === 0) {
    analysis.weaknesses.push("ai_analysis.work_missing");
    analysis.recommendations.push({
      section: "form.work_experience",
      suggestion: "ai_analysis.work_add",
      priority: "high",
    });
  } else {
    const hasDetailedDescriptions = resume.workExperience.some(
      (exp) => exp.description && exp.description.length >= 3,
    );

    if (hasDetailedDescriptions) {
      analysis.strengths.push("ai_analysis.work_detailed");
    } else {
      analysis.suggestions.push("ai_analysis.work_add_details");
      analysis.recommendations.push({
        section: "form.work_experience",
        suggestion: "ai_analysis.work_recommendation",
        priority: "medium",
      });
    }
  }

  // Analyze education
  if (resume.education.length > 0) {
    analysis.strengths.push("ai_analysis.education_listed");
  } else {
    analysis.suggestions.push("ai_analysis.education_consider");
    analysis.recommendations.push({
      section: "form.education",
      suggestion: "ai_analysis.education_recommendation",
      priority: "low",
    });
  }

  // Analyze skills
  const technicalSkills = resume.skills.filter(
    (s) => s.category === "technical",
  );
  const softSkills = resume.skills.filter((s) => s.category === "soft");

  if (technicalSkills.length >= 5) {
    analysis.strengths.push("ai_analysis.technical_good");
  } else if (technicalSkills.length > 0) {
    analysis.suggestions.push("ai_analysis.technical_add_more");
  }

  if (softSkills.length >= 3) {
    analysis.strengths.push("ai_analysis.softskills_listed");
  } else if (softSkills.length === 0) {
    analysis.recommendations.push({
      section: "form.skills",
      suggestion: "ai_analysis.softskills_add",
      priority: "medium",
    });
  }

  // General suggestions
  if (resume.workExperience.length > 0 && resume.education.length > 0) {
    analysis.suggestions.push("ai_analysis.general_certificates");
  }

  return analysis;
}

function calculateResumeScore(resume: Resume): number {
  let score = 0;
  const maxScore = 100;

  // Personal info (20 points)
  if (resume.personalInfo.firstName && resume.personalInfo.lastName) score += 5;
  if (resume.personalInfo.email) score += 5;
  if (resume.personalInfo.phone) score += 3;
  if (resume.personalInfo.summary && resume.personalInfo.summary.length > 50)
    score += 7;

  // Work experience (30 points)
  if (resume.workExperience.length > 0) {
    score += 10;
    resume.workExperience.forEach((exp) => {
      if (exp.description && exp.description.length >= 3) score += 4;
    });
  }

  // Education (20 points)
  if (resume.education.length > 0) {
    score += 10;
    if (resume.education.some((edu) => edu.field)) score += 5;
    if (resume.education.some((edu) => edu.gpa)) score += 5;
  }

  // Skills (30 points)
  if (resume.skills.length >= 5) {
    score += 15;
    const hasTechnical = resume.skills.some((s) => s.category === "technical");
    const hasSoft = resume.skills.some((s) => s.category === "soft");
    if (hasTechnical) score += 8;
    if (hasSoft) score += 7;
  }

  return Math.min(score, maxScore);
}

async function analyzeWithAI(
  resume: Resume,
  language: string,
): Promise<AIAnalysis> {
  const resumeToon = encode(resume);

  const prompt = `Analyze this resume and provide evaluation.
Language: ${language}

Resume (TOON format):
${resumeToon}

RETURN IN TOON FORMAT:
analysis:
  score: 0-100
  strengths[N]: strength1,strength2,...
  weaknesses[N]: weakness1,weakness2,...
  suggestions[N]: suggestion1,suggestion2,...
  recommendations[N]{section,suggestion,priority}:
    Section Name,Specific recommendation,high/medium/low
    ...

Return ONLY valid TOON format (no JSON, no markdown).`;

  const response = await aiComplete({
    systemPrompt: "You are a professional resume analyst.",
    userPrompt: prompt,
    temperature: 0.3,
  });

  const content = response.content;

  // Try TOON first, fallback to JSON
  try {
    const decoded = decode(content, { strict: false }) as Record<
      string,
      unknown
    >;
    if (decoded.analysis) {
      const a = decoded.analysis as Record<string, unknown>;
      return {
        score: Number(a.score) || 0,
        strengths: Array.isArray(a.strengths) ? a.strengths : [],
        weaknesses: Array.isArray(a.weaknesses) ? a.weaknesses : [],
        suggestions: Array.isArray(a.suggestions) ? a.suggestions : [],
        recommendations: Array.isArray(a.recommendations)
          ? a.recommendations.map((r: any) => ({
              section: r.section || "",
              suggestion: r.suggestion || "",
              priority: r.priority || "medium",
            }))
          : [],
      };
    }
  } catch {
    // Fallback to JSON
  }

  return JSON.parse(content);
}

export function getResumeImprovementTips(
  analysis: AIAnalysis,
): ImprovementTip[] {
  const tips: ImprovementTip[] = [];

  if (analysis.score < 60) {
    tips.push({ type: "info", message: "ai_tip.poor_score" });
  } else if (analysis.score < 80) {
    tips.push({ type: "info", message: "ai_tip.good_score" });
  } else {
    tips.push({ type: "info", message: "ai_tip.excellent_score" });
  }

  analysis.recommendations
    .filter((rec) => rec.priority === "high")
    .forEach((rec) => {
      tips.push({ type: "high", message: rec.suggestion });
    });

  analysis.recommendations
    .filter((rec) => rec.priority === "medium")
    .forEach((rec) => {
      tips.push({ type: "medium", message: rec.suggestion });
    });

  analysis.recommendations
    .filter((rec) => rec.priority === "low")
    .forEach((rec) => {
      tips.push({ type: "low", message: rec.suggestion });
    });

  return tips;
}
