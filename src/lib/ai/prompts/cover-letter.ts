const COVER_LETTER_SHARED_RULES = `Rules:
- Use only candidate profile facts.
- Detect JD language from the JD body and write entirely in that language.
- No markdown, no bold, no headers, no emoji.
- If a requirement is unsupported, omit it.
- Nice-to-have items may be used only if supported by the profile.`;

const COVER_LETTER_PROSE_RULES = `Write a concise, high-signal cover letter.

${COVER_LETTER_SHARED_RULES}

Structure:
- greeting
- 1-line intro with first name and exact role title
- short hook with proof
- dense core-match paragraph covering 3-4 top requirements
- short ownership/fit paragraph
- closing + "Regards, Full Name"

Voice:
- evidence-first, not needy
- no generic JD restatement
- hook should not start with "I" / "Я" / "As a developer"
- use at least one metric when available`;

const COVER_LETTER_BULLET_RULES = `Write a compact bullet-format cover letter.

${COVER_LETTER_SHARED_RULES}

Output order:
1. greeting
2. intro sentence
3. hook sentence
4. 5-8 bullets
5. closing
6. Regards + full name

Bullet rule:
- one JD requirement -> one proof point
- format: - [requirement]: [proof]
- order by JD importance`;

const TAILORED_RESUME_SYSTEM_PROMPT = `Create a tailored resume in valid JSON.

Use only candidate profile facts. Never invent location, skills, tools, dates, or achievements.
If location is missing in profile, output "".
If phone, website, linkedin, or telegram are missing, output "".
Build skills only from candidate profile and include relevant matching skills when present.

Write in the requested language.
Keep chronology honest.
Sort workExperience by startDate descending. Pet projects last.

Relevance scoring:
- 3 = direct match -> 3-5 description items
- 2 = adjacent match -> exactly 1 description item
- 1 = irrelevant -> omit role

Formatting:
- allowed HTML tags only in summary/description: <b>, <i>
- each score-3 bullet should contain at least one <b>
- summary should contain at least 3 <b> and 1 <i>

Return only JSON:
{
  "personalInfo": { "firstName": "", "lastName": "", "email": "", "phone": "", "location": "", "website": "", "linkedin": "", "telegram": "", "summary": "" },
  "workExperience": [{ "title": "", "company": "", "location": "", "startDate": "YYYY-MM", "endDate": "", "current": false, "description": [""], "employmentType": "full_time or part_time or contract or pet_project" }],
  "education": [{ "institution": "", "degree": "", "field": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "current": false }],
  "skills": [{ "name": "", "category": "technical", "level": "advanced" }],
  "detectedLanguage": "en",
  "targetPosition": "",
  "targetCompany": ""
}`;

export function getCoverLetterSystemPrompt(format: "prose" | "bullet"): string {
  return format === "bullet"
    ? COVER_LETTER_BULLET_RULES
    : COVER_LETTER_PROSE_RULES;
}

export function buildCoverLetterUserPrompt(params: {
  jobDescription: string;
  profileToon: string;
}): string {
  return `=== JOB DESCRIPTION ===
${params.jobDescription}

=== CANDIDATE PROFILE (source of all facts) ===
${params.profileToon}

Write the cover letter now.
- Detect the JD language from the JD body.
- Use only facts from the candidate profile.
- If a requirement is unsupported, omit it.
- Output a complete letter from greeting through closing.`;
}

export function getTailoredResumeSystemPrompt(): string {
  return TAILORED_RESUME_SYSTEM_PROMPT;
}

export function buildTailoredResumeUserPrompt(params: {
  jobDescription: string;
  profileToon: string;
  resumeLanguage: string;
}): string {
  const languageInstruction =
    params.resumeLanguage === "jd"
      ? `Detect the JD body language and write the entire resume in that language. Set detectedLanguage to the ISO 639-1 code you detected.`
      : `Write the entire resume in English regardless of JD language. Set detectedLanguage to "en".`;

  return `=== JOB DESCRIPTION ===
${params.jobDescription}

=== CANDIDATE PROFILE (source of all facts) ===
${params.profileToon}

${languageInstruction}

Create the tailored resume now.
- Score every role for relevance before writing.
- Use chronology for ordering.
- Use <b> and <i> tags exactly as instructed.
- Output only valid JSON.`;
}
