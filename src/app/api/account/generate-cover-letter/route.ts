import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { encode } from "@toon-format/toon";
import { aiComplete } from "@/lib/ai";

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

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobDescription, format = "prose" } = await request.json();

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

    const userPrompt = `=== JOB DESCRIPTION (detect language, fix typos) ===
${jobDescription}

=== CANDIDATE PROFILE (source of ALL facts — use specific numbers, company names, years) ===
${profileToon}

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

    return NextResponse.json({
      success: true,
      coverLetter: response.content.trim(),
    });
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { error: "Error generating cover letter" },
      { status: 500 },
    );
  }
}
