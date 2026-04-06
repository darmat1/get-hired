import { RESUME_SCORE_PROMPT } from "../resume-score-prompt";

export function buildResumeScoreSystemPrompt(): string {
  return "You are an expert resume analyst. Return ONLY valid JSON, no other text, no markdown code blocks, no explanations. The output must be parseable by JSON.parse().";
}

export function buildResumeScoreUserPrompt(params: {
  formattedResume: string;
  language: string;
  currentDate: string;
  currentYear: number;
}): string {
  return `${RESUME_SCORE_PROMPT}

### IMPORTANT CONTEXT
- Current date: ${params.currentDate}
- Current year: ${params.currentYear}
- Use this to validate employment dates. A start date in the future (${params.currentYear + 1} or later) or beyond current date is invalid.
- Respond in ${params.language}.

Resume to analyze:
${params.formattedResume}`;
}

export function buildCompanyScoreUserPrompt(params: {
  formattedExperience: string;
  language: string;
  currentDate: string;
  currentYear: number;
}): string {
  return `Analyze this single work experience entry and return ONLY valid JSON.

### IMPORTANT CONTEXT
- Current date: ${params.currentDate}
- Current year: ${params.currentYear}
- Use this to validate employment dates. A start date in the future (${params.currentYear + 1} or later) or beyond current date is invalid.
- Respond in ${params.language}.

### SEVERITY LEVELS
RED - major issues:
- Job title has zero relevance to target role
- Dates are impossible
- No description provided
- Spelling errors in job title or company name

YELLOW - concerns:
- Description is too brief or generic
- No measurable achievements
- Duties listed instead of achievements
- Short tenure without explanation
- Description mentions technologies not relevant to target role

GREEN - strengths:
- Clear measurable achievements
- Increased responsibility or progression
- Relevant technologies or methodologies
- Concrete impact and results

### OUTPUT FORMAT
{
  "score": 0,
  "scoreLabel": "Weak | Fair | Good | Strong | Excellent",
  "summary": "2 sentence assessment",
  "red": [{"field": "...", "issue": "...", "recommendation": "..."}],
  "yellow": [{"field": "...", "issue": "...", "recommendation": "..."}],
  "green": [{"field": "...", "strength": "..."}]
}

Scoring: Start at 100, deduct 15 per RED, deduct 5 per YELLOW, add 2 per GREEN with a max bonus of 10.

Experience to analyze:
${params.formattedExperience}`;
}
