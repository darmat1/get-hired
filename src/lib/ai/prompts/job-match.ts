export function buildJobMatchSystemPrompt(): string {
  return "You are an expert ATS and resume analyst. Return ONLY valid JSON matching the specified schema. No markdown, no explanations.";
}

export function buildJobMatchUserPrompt(params: {
  formattedResume: string;
  jobDescription: string;
  language: string;
}): string {
  return `Compare the resume below against the job description and return a JSON object.

### OUTPUT SCHEMA
{
  "matchScore": <integer 0-100>,
  "matchLabel": <"Poor" | "Fair" | "Good" | "Great" | "Excellent">,
  "summary": "<2-3 sentence overall assessment>",
  "presentKeywords": ["<keyword>", ...],
  "missingKeywords": ["<keyword>", ...],
  "suggestions": [
    {
      "section": <"summary" | "experience" | "skills" | "education">,
      "priority": <"high" | "medium" | "low">,
      "suggestion": "<specific actionable advice>",
      "example": "<optional rewrite example>"
    }
  ]
}

### SCORING GUIDE
- matchScore 0-40 → Poor
- matchScore 41-60 → Fair
- matchScore 61-75 → Good
- matchScore 76-89 → Great
- matchScore 90-100 → Excellent

### RULES
- presentKeywords: list ALL skills, tools, technologies, and role-specific terms found in BOTH the resume AND job description (max 15)
- missingKeywords: list important requirements from the job description that are NOT in the resume (max 10)
- suggestions: provide 3-6 concrete improvements ordered by priority (high first)
- Each suggestion must name the specific section to improve
- Respond in ${params.language}

### JOB DESCRIPTION
${params.jobDescription}

### RESUME
${params.formattedResume}`;
}
