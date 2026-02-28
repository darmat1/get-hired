import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { encode } from "@toon-format/toon";
import { aiComplete } from "@/lib/ai/server-ai";

const SHARED_RULES = `### LANGUAGE ENFORCEMENT (ABSOLUTE PRIORITY)
- Identify the PRIMARY language of the Job Description (JD) text.
- Ignore accidentally pasted website UI buttons or navigation words (e.g., "Підписатись", "Зберегти", "Сховати", "Save", "Apply", "Share").
- The ENTIRE output MUST be in the JD's primary language.
- If the profile is in a different language, TRANSLATE the facts to the primary JD language.

### FIX TYPOS IN JOB DESCRIPTION
- If the JD contains obvious typos in technology names, use the CORRECT spelling in your letter.
- Examples: "formki" → "Formik", "redax" → "Redux", "Reakt" → "React", "typeskript" → "TypeScript", "noad" → "Node", "ekspres" → "Express".
- NEVER copy typos from the JD into the cover letter.

### DATA INTEGRITY (CRITICAL — ANTI-HALLUCINATION)
- Use ONLY facts, numbers, and details that are EXPLICITLY present in the CANDIDATE PROFILE.
- Extract and USE specific metrics: years of experience, team sizes, project counts, performance numbers, company names, technologies used.
- If the profile says "Led a team of 5 developers" — write exactly that, not "Led a large team".
- If a specific metric is NOT in the profile, describe the experience qualitatively. NEVER invent numbers.
- Do NOT just say "I have experience with X". Instead say "I have N years of experience with X, having used it at [Company] to [specific achievement]".

### FORMATTING
- Plain text only. NO markdown, NO asterisks, NO bold.`;

const PROSE_PROMPT = `You are writing a cover letter on behalf of a Candidate. Write a compelling, SPECIFIC letter using REAL facts from their profile.

${SHARED_RULES}

### WRITING PROCESS
- Step 1: Read the JD. Identify the company name, the role, and 3-5 KEY requirements.
- Step 2: Calculate the candidate's years of experience specifically in the REQUIRED STACK (not total career years).
- Step 3: For EACH key requirement, find the MOST SPECIFIC matching fact from the profile (with numbers, company names, outcomes).
- Step 4: Find relevant soft skills from the profile.

### OUTPUT STRUCTURE (strictly follow this template)
Line 1: Greeting to the company team (e.g. "Hello, [Company] team!" or equivalent in detected language).

Paragraph 1 (2-3 sentences): Introduce the candidate by name. State interest in the specific role. Mention years of experience specifically in the REQUIRED STACK (calculate from work dates in profile — only count positions where the stack was used). Do NOT use total career years.

Paragraph 2: For each key JD requirement, describe the candidate's relevant experience using SPECIFIC metrics from the profile — company names, team sizes, project outcomes, technologies. Write in natural prose, NOT bullet list.

Paragraph 3: Describe the candidate's soft skills and strengths using information from the profile (teamwork, leadership, communication, mentoring, etc.).

Last line: A brief well-wish and the candidate's full name as signature.

### WHAT NOT TO DO
- Do NOT write generic phrases like "I have extensive experience in..." without specifics.
- Do NOT list JD requirements back with "I can do this".
- Do NOT use bullet points or dashes.
- Do NOT copy the JD text back.
- Do NOT hallucinate or invent facts not present in the profile.
- Do NOT use total career years — calculate years ONLY in the required stack.`;

const BULLET_PROMPT = `You are writing a concise cover letter on behalf of a Candidate using a bullet-list format. Use REAL facts from their profile.

${SHARED_RULES}
- Use a simple hyphen list ("- Skill: Result with specific metrics").

### WRITING PROCESS
- Step 1: Read the JD. Identify 3-5 KEY requirements.
- Step 2: For EACH requirement, find the MOST SPECIFIC matching fact from the profile.

### OUTPUT STRUCTURE
Line 1: One sentence stating interest in the role + strongest qualification with a SPECIFIC metric.

- [Key JD requirement]: [Specific matching fact from profile with numbers, company name, outcome]
- [Key JD requirement]: [Specific matching fact from profile with numbers, company name, outcome]
- [Key JD requirement]: [Specific matching fact from profile with numbers, company name, outcome]

Last line: Closing sentence.

### WHAT NOT TO DO
- Do NOT write generic "I can do this" — every bullet MUST have a specific fact.
- Do NOT hallucinate or invent facts not present in the profile.
- Do NOT copy the JD requirements verbatim as bullet text.`;

const TAILORED_RESUME_PROMPT = `You are an expert resume writer creating a SELLING, results-driven resume. Your task is to create a TAILORED resume in structured JSON format for a specific job posting.

### LANGUAGE ENFORCEMENT (ABSOLUTE PRIORITY)
- Identify the PRIMARY language of the Job Description (JD) text.
- The ENTIRE resume content MUST be in the JD's primary language.
- If the profile is in a different language, TRANSLATE all content to the JD language.

### FIX TYPOS IN JOB DESCRIPTION
- If the JD contains obvious typos in technology names, use the CORRECT spelling.

### KEY PRINCIPLES

1. **SELL, DON'T TELL**: Every bullet point must demonstrate VALUE and IMPACT.
   - BAD: "Worked on frontend development"
   - GOOD: "Developed 15+ React components serving 50K+ daily users, reducing page load time by 40%"

2. **RELEVANCE FILTER**: 
   - ONLY include work experience RELEVANT to the target role.
   - EXCLUDE completely unrelated experience (driver, waiter, construction worker for a developer role).
   - ADJACENT fields (project management, QA, design) MAY be included if they add value.

3. **KEYWORD SATURATION**:
   - Identify ALL key technologies, skills, and buzzwords from the JD.
   - Weave them naturally into summary, descriptions, and skills.
   - Ensure maximum ATS keyword match.

4. **METRICS AND RESULTS**:
   - Use numbers from the profile: team sizes, user counts, performance improvements, project counts.
   - If a metric exists in the profile, USE IT. Do NOT invent numbers.
   - Frame achievements with impact: "Reduced X by Y%", "Increased Z by N%", "Led team of N".

5. **PROFESSIONAL SUMMARY**:
   - Write a powerful 2-3 sentence summary targeting the SPECIFIC role.
   - Include years of experience in the REQUIRED STACK (not total career).
   - Mention 2-3 key technologies from the JD.

6. **SKILLS**:
   - List skills from the JD FIRST, but only if the candidate has them.
   - Add complementary skills from the profile.
   - Remove skills irrelevant to the role.
   - Use "technical", "soft", or "language" for category.
   - Use "beginner", "elementary", "intermediate", "advanced", or "expert" for level.

### OUTPUT FORMAT
Return ONLY valid JSON (no markdown, no backticks, no explanation) with this exact structure:

{
  "personalInfo": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "website": "string or empty",
    "linkedin": "string or empty",
    "telegram": "string or empty",
    "summary": "2-3 powerful sentences tailored to the role"
  },
  "workExperience": [
    {
      "id": "unique-id",
      "title": "Job Title (can be adjusted to match JD terminology)",
      "company": "Company Name",
      "location": "City, Country",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or empty if current",
      "current": false,
      "description": [
        "Achievement with metrics and JD keywords",
        "Another achievement emphasizing relevant skills"
      ]
    }
  ],
  "education": [
    {
      "id": "unique-id",
      "institution": "University Name",
      "degree": "Degree",
      "field": "Field of Study",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "current": false,
      "gpa": "optional"
    }
  ],
  "skills": [
    {
      "id": "unique-id",
      "name": "Skill Name",
      "category": "technical",
      "level": "advanced"
    }
  ]
}

### CRITICAL RULES
- Output ONLY the JSON object, nothing else.
- Use ONLY facts from the candidate profile. NEVER invent data.
- Each work experience "description" array should have 3-5 bullet points.
- Generate unique IDs for each item (use format like "we-1", "we-2", "edu-1", "skill-1", etc.).
- Keep only RELEVANT positions. Filter out unrelated jobs.
- Rewrite descriptions to maximize keyword matches and emphasize measurable results.`;

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
      format = "prose",
      generateResume = false,
    } = await request.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 },
      );
    }

    // Get user profile (not resumes)
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "No profile found. Please add your experience first." },
        { status: 400 },
      );
    }

    // Encode profile data as TOON for token efficiency
    const profileData = {
      personalInfo: profile.personalInfo,
      workExperience: profile.workExperience,
      education: profile.education,
      skills: profile.skills,
    };
    const profileToon = encode(profileData);

    const systemPrompt = format === "bullet" ? BULLET_PROMPT : PROSE_PROMPT;

    const userPrompt = `=== JOB DESCRIPTION ===
${jobDescription}

=== CANDIDATE PROFILE (source of ALL facts — use specific numbers, company names, years) ===
${profileToon}

IMPORTANT: Detect the PRIMARY language of the Job Description above. Write the ENTIRE cover letter in THAT language. If the profile is in a different language, translate the facts to the JD language.
Write the cover letter now. Use ONLY facts from the profile above.`;

    const response = await aiComplete(
      {
        systemPrompt,
        userPrompt,
        temperature: 0.3,
        maxTokens: 1500,
      },
      session.user.id,
    );

    const result: {
      success: boolean;
      coverLetter: string;
      resumeId?: string;
    } = {
      success: true,
      coverLetter: response.content.trim(),
    };

    // Generate tailored resume if requested
    if (generateResume) {
      const resumeUserPrompt = `=== JOB DESCRIPTION (use for keyword matching ONLY) ===
${jobDescription}

=== CANDIDATE FULL PROFILE (source of ALL facts — use ONLY what is here) ===
${profileToon}

IMPORTANT: Write the resume content in the SAME LANGUAGE as the candidate profile above. Do NOT use the JD language — use the PROFILE language for all text (summary, descriptions, skills). Only match JD keywords by meaning, not by copying foreign-language terms.
Create a tailored, selling resume now. Output ONLY valid JSON. Include ONLY relevant experience. Filter out unrelated jobs. Maximize keyword matches from the JD. Use metrics and numbers from the profile.`;

      const resumeResponse = await aiComplete(
        {
          systemPrompt: TAILORED_RESUME_PROMPT,
          userPrompt: resumeUserPrompt,
          temperature: 0.3,
          maxTokens: 3000,
        },
        session.user.id,
      );

      // Parse the AI response as JSON
      let resumeJson;
      try {
        // Clean up potential markdown code blocks
        let content = resumeResponse.content.trim();
        if (content.startsWith("```json")) {
          content = content.slice(7);
        } else if (content.startsWith("```")) {
          content = content.slice(3);
        }
        if (content.endsWith("```")) {
          content = content.slice(0, -3);
        }
        content = content.trim();
        resumeJson = JSON.parse(content);
      } catch {
        console.error(
          "Failed to parse AI resume JSON:",
          resumeResponse.content,
        );
        return NextResponse.json(
          { error: "Failed to generate structured resume. Please try again." },
          { status: 500 },
        );
      }

      // Extract the first line from JD to use as a title hint
      const firstLine = jobDescription.trim().split("\n")[0].slice(0, 80);
      const resumeTitle = `Tailored: ${firstLine}`;

      // Save the tailored resume to the database
      const savedResume = await (prisma.resume.create as any)({
        data: {
          title: resumeTitle,
          template: "modern",
          language: "en",
          personalInfo: resumeJson.personalInfo || {},
          workExperience: resumeJson.workExperience || [],
          education: resumeJson.education || [],
          skills: resumeJson.skills || [],
          certificates: resumeJson.certificates || [],
          userId: session.user.id,
        },
      });

      result.resumeId = savedResume.id;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { error: "Error generating cover letter" },
      { status: 500 },
    );
  }
}
