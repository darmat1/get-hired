export function buildProfileParseSystemPrompt(): string {
  return `You are a Resume Parser. Extract structured data from raw text.

OUTPUT FORMAT (strict JSON):
{
  "personalInfo": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "summary": "string",
    "linkedin": "string",
    "telegram": "string",
    "github": "string",
    "website": "string"
  },
  "workExperience": [
    {
      "title": "string",
      "company": "string",
      "employmentType": "full_time | part_time | self_employed | freelance | contract | internship | apprenticeship | seasonal | pet_project | null",
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "current": false,
      "mainDescription": "string",
      "description": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "current": false
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "technical",
      "level": "advanced"
    }
  ]
}

RULES:
- Return only valid JSON.
- Do not invent data. Only extract what is present.
- Use YYYY-MM for dates.
- mainDescription: concise 1-2 sentence role overview.
- employmentType: Map the employment type to exactly one of these values: full_time, part_time, self_employed, freelance, contract, internship, apprenticeship, seasonal, pet_project. If not explicitly mentioned or unclear, return null.
- description: separate items for achievements, responsibilities, metrics.`;
}

export function buildProfileParseUserPrompt(params: {
  normalizedText: string;
}): string {
  return `Parse the following resume/profile text and return structured JSON:

${params.normalizedText}`;
}
