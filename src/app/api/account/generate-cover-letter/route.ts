import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { encode } from "@toon-format/toon";
import { aiComplete } from "@/lib/ai/server-ai";

const SHARED_RULES = `### STEP 0 — DETECT LANGUAGE (ABSOLUTE FIRST)
- Read the entire Job Description (JD).
- Detect its PRIMARY language (English, Ukrainian, Russian, Polish, etc.).
- Ignore UI elements like "Save", "Apply", "Підписатись", "Войти" — these are navigation, not content.
- The ENTIRE output — every word — must be in the JD's detected language.
- All candidate facts from the profile must be TRANSLATED into the JD language.

### STEP 1 — EXTRACT JD REQUIREMENTS (CRITICAL)
- Find sections labeled "Requirements", "What we expect", "Responsibilities", "Must have", or equivalents in any language
  ("Що ми очікуємо", "Вимоги", "Ожидания", "Требования", "Wymagania", "We are looking for", etc.).
- Rank the 5–8 MOST IMPORTANT requirements. These are what the employer most needs.

### STEP 2 — MATCH PROFILE TO REQUIREMENTS
- For EACH top requirement, find the BEST matching fact from the CANDIDATE PROFILE.
- Prioritize facts with NUMBERS: years, team sizes, project counts, percentages, user counts.
- If a metric exists in the profile — USE IT exactly. Do NOT invent or exaggerate.
- If no metric — describe concretely but qualitatively.
- Skip requirements with zero evidence in the profile.

### DATA INTEGRITY — NON-NEGOTIABLE
- Use ONLY facts explicitly present in the CANDIDATE PROFILE.
- Never invent numbers, companies, projects, technologies, or dates.
- Never use total career years — calculate relevant stack experience only.

### FIX TYPOS IN JD
- Silently correct obvious typos in tech names: "formki"→Formik, "redax"→Redux, "noad"→Node.
- Never copy JD typos into the letter.

### FORMATTING
- Plain text only. No markdown. No asterisks. No bold. No headers.`;

const PROSE_PROMPT = `You are a senior copywriter and career strategist. You write cover letters that make recruiters stop and think: "This is exactly who we need."

${SHARED_RULES}

### THE VOICE
- Write like a confident professional speaking directly to a peer — not a job applicant begging for attention.
- No robotic openers. No "I am applying for the position of...". No "I have extensive experience in...".
- Every sentence must either prove something or advance the story. Cut anything decorative.
- Vary sentence length. Mix short punches with longer evidence sentences. Keep it human.

### STRUCTURE

Greeting — SALUTATION (standalone line):
  A warm, natural greeting to the team. Extract the company name from the JD if present.
  Examples: "Hi [Company] team,", "Hello [Company] team,", "Привіт команді [Company],", "Здравствуйте, команда [Company],"
  If no company name found — use "Hi there," or equivalent in the JD language.
  This must appear as a standalone line before Paragraph 1.

Paragraph 1 — HOOK (2–3 sentences):
  Do NOT start with "I" or "Я". Start with an observation about what THEY need, then immediately pivot to the candidate's strongest proof.
  Name the specific role. Include one concrete metric that proves fit.
  The recruiter must feel: "This person already gets what we're building."

Paragraph 2 — CORE MATCH (4–5 sentences):
  Address the top 3–4 JD requirements directly — one sentence each.
  Format per sentence: [JD keyword as natural phrase] + [specific proof with metric from profile].
  Do NOT list. Write flowing prose where each sentence lands like evidence.
  This paragraph is the heart. Make it dense with real facts.

Paragraph 3 — AUTONOMY & FIT (2–3 sentences):
  Show the candidate fits the TEAM CULTURE described in the JD (remote, no micromanagement, ownership, etc.).
  Ground it in a real situation from the profile — not a generic claim.

Last line — CLOSE:
  One confident, forward-looking sentence. Candidate's full name.

### LENGTH
900–1400 characters total. Be sharp. Cut filler ruthlessly.

### EXAMPLE OF PERFECT OUTPUT
(This is a real example for an English-language Frontend/AI role. Use it as a style and structure reference — do NOT copy its content. Adapt fully to the actual JD and profile provided.)

---
Hi GetHired team,

You're looking for a developer who treats AI not as a buzzword to list on a resume, but as infrastructure to architect around. That's exactly what I do at GetHired.work — built the entire AI career platform from scratch on Next.js, where prompt orchestration, response streaming, and error handling are core to the architecture, not bolted on top.

On your stack: React and Next.js App Router have been my primary tools for 3+ years. At b0arding.com I led the full migration from Pages Router to App Router with React Server Components and a Redis caching layer, cutting page response times by 40% and pushing Core Web Vitals into the green. Performance isn't an afterthought — I hit Lighthouse 98/100 on mobile for a platform where 60% of traffic is mobile. On the AI side, I built a proprietary prompt abstraction layer that improved content quality by 45% and achieved 100% accuracy extracting structured data from LinkedIn PDFs.

I'm used to working without hand-holding — at GetHired.work I wear the hats of product owner, engineer, and prompt architect simultaneously, making and owning architectural decisions end to end.

Happy to walk through the codebase. Andrew Kupriyanov.
---

### FORBIDDEN
- Starting with "I" or "Я"
- "I have extensive experience in..." without immediate specific proof
- Restating JD requirements without a matching profile fact
- Three paragraphs that all start with the same word or pattern
- Bullet points or dashes inside paragraphs
- Copying JD sentences verbatim
- Inventing any data not in the profile`;

const BULLET_PROMPT = `You are a senior copywriter writing a bullet-format cover letter. Goal: give a recruiter a scannable, evidence-packed proof of fit in under 30 seconds of reading.

${SHARED_RULES}

### THE VOICE
- Confident, direct, zero filler.
- The opening line must hook — not announce.
- Each bullet must feel like a checkmark on the recruiter's wishlist.

### STRUCTURE

GREETING (standalone line):
  A warm, natural greeting to the team. Extract the company name from the JD if present.
  Examples: "Hi [Company] team,", "Hello [Company] team,", "Привіт команді [Company],", "Здравствуйте, команда [Company],"
  If no company name found — use "Hi there," or equivalent in the JD language.
  This must appear as a standalone line before the opening line.

OPENING LINE (1 sentence):
  Do NOT start with "I" or "Я".
  Frame around what THEY are building + candidate's strongest credential with a metric.

BULLET BLOCK (5–8 bullets):
  Format: "- [JD requirement keyword]: [specific proof from profile with metric or concrete detail]"
  Rules:
  - Left side = JD keyword (gives recruiter instant visual match to their checklist).
  - Right side = specific fact from profile. MUST include a number or named concrete achievement.
  - Order by JD priority: most critical requirement first.
  - No bullet without real evidence from the profile. Skip requirements with no match.
  - Bad: "- React: маю досвід роботи з React"
  - Good: "- React / Next.js: 3+ роки в App Router, міграція Pages→App Router у b0arding.com, Redis-кеш −40% response time"

CLOSING LINE (1 sentence):
  Confident, forward-looking. Full candidate name.

### EXAMPLE OF PERFECT OUTPUT
(Style and structure reference only — do NOT copy content. Adapt fully to the actual JD and profile provided.)

---
Hi GetHired team,

Frontend for AI-driven products is my core focus: at GetHired.work I built the entire platform from scratch, with AI pipelines, streaming, and prompt architecture as first-class citizens of the Next.js app.

- React / Next.js: 3+ years in App Router, led Pages→App Router migration at b0arding.com with Redis caching — response time down 40%
- AI integrations: proprietary prompt abstraction layer at GetHired.work — +45% content quality, 100% accuracy parsing LinkedIn PDFs
- SSR / Performance: Lighthouse 98/100 on mobile, Core Web Vitals optimization across production at b0arding.com
- Tailwind / CSS: primary stack at GetHired.work and b0arding.com, responsive layouts serving 60%+ mobile users
- API integrations: OpenAI, Claude, REST API, Stripe, WebSockets — across three separate products
- Autonomy: product owner + engineer + prompt architect in one person, full ownership of architectural decisions

Happy to discuss further and share code. Andrew Kupriyanov.
---

### FORBIDDEN
- Bullets without concrete proof from the profile
- Opening with "I", "Я", "Мене звати"
- Inventing any metric or technology not in the profile
- Copying JD requirement text as-is without connecting to a profile fact`;

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

    // Check resume limit if tailoring is requested
    if (generateResume) {
      const resumeCount = await prisma.resume.count({
        where: { userId: session.user.id },
      });

      if (resumeCount >= 2) {
        return NextResponse.json(
          {
            error:
              "Resume limit reached. Please delete an existing resume to generate a new tailored version.",
          },
          { status: 403 },
        );
      }
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
        maxTokens: 3000,
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
          maxTokens: 4000,
          responseFormat: { type: "json_object" },
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
