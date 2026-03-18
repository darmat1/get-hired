import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { encode } from "@toon-format/toon";
import { aiComplete } from "@/lib/ai/server-ai";

const SHARED_RULES = `### STEP 0 — DETECT LANGUAGE (ABSOLUTE FIRST)
- Read the entire Job Description (JD).
- Detect its PRIMARY language based ONLY on the BODY TEXT: responsibilities section, requirements section, and company description paragraph.
- IGNORE the job title line — it is often in English even for Ukrainian/Russian vacancies. "Front-End Developer (Vue 3)" is NOT a language signal.
- IGNORE completely: UI navigation words ("Підписатись", "Зберегти", "Сховати", "Відгукнутись", "Save", "Apply", "Войти"), section labels ("Вимоги до володіння мовами"), and technology names.
- RULE: If the requirements and responsibilities are written in Ukrainian — write the ENTIRE letter in Ukrainian, even if the job title is in English.
- RULE: If the requirements and responsibilities are written in English — write in English, even if there are Ukrainian UI words present.
- When in doubt — count full sentences in the body. The language with more sentences wins.
- The ENTIRE output — every word — must be in the JD's detected language.
- All candidate facts from the profile must be TRANSLATED into the JD language.

### STEP 1 — EXTRACT JD REQUIREMENTS (CRITICAL)
- Find sections labeled "Requirements", "What we expect", "Responsibilities", "Must have", or equivalents in any language
  ("Що ми очікуємо", "Вимоги", "Ожидания", "Требования", "Wymagania", "We are looking for", etc.).
- Rank the 5–8 MOST IMPORTANT requirements. These are what the employer most needs.
- SEPARATELY find "Nice to have", "Plus", "Буде плюсом", "Бажано", "Приємний бонус" sections.
- For each Nice to have item — check if the candidate profile has matching evidence.
- If YES — this is a COMPETITIVE ADVANTAGE. Include it naturally in Paragraph 2 alongside must-have matches, without any special labeling or signal phrases.

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
- If a JD requirement has NO matching evidence in the profile — DO NOT mention it at all. Silence is better than a lie.
- SPECIFIC CHECK: Before mentioning any library, framework, or methodology — verify it exists in the profile's skills or work experience descriptions. If it is only in the JD — do not use it.

### FIX TYPOS IN JD
- Silently correct obvious typos in tech names: "formki"→Formik, "redax"→Redux, "noad"→Node.
- Never copy JD typos into the letter.

### FORMATTING
- Plain text only. No markdown. No asterisks. No bold. No headers.
- Use regular hyphen (-) instead of em dash (—) everywhere.
- No emoji of any kind. Ever.`;

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
  Examples: "Hello [Company] team,", "Привіт команді [Company],", "Здравствуйте, команда [Company],"
  If no company name found — use "Hello there," or equivalent in the JD language.
  This must appear as a standalone line before Paragraph 1.

Introduction line (1 sentence, immediately after greeting):
  Candidate introduces themselves by FIRST NAME ONLY and states interest in the specific position.
  Extract the exact job title from the JD.
  Examples:
  - "Мене звати Andrew, і мене зацікавила ваша вакансія Front-end Developer (VueJS)."
  - "My name is Andrew, and I'm excited about your Front-end Developer role."
  - "Меня зовут Andrew, и я заинтересован в вашей вакансии Senior React Developer."
  This must be natural and concise — one sentence only.

Paragraph 1 — HOOK (2–3 sentences):
  Start with a VARIED, natural opening. Choose one of these approaches (do NOT repeat the same pattern for every letter):
  - Lead with a stack match across multiple jobs: "Vue, WebSockets, SSR - that's the core of my last two years at b0arding.com and ReSpot, where I built two different SaaS products from scratch."
  - Lead with results across multiple jobs: "40% faster page loads at b0arding.com, 85% reduction in resume creation time at GetHired.work, real-time trading charts at iCoinSoftware - performance and product impact are what I optimize for."
  - Lead with a specific achievement: "At ReSpot I built a relocation SaaS platform from scratch using Vue - complex UI workflows, Stripe payouts, full responsiveness across all devices."
  Rules:
  - NEVER start with "Ви шукаєте", "You are looking for", "I am applying" — these are robotic openers.
  - Do NOT start with "I", "Я", "Як розробник", "As a developer", "Мене звати".
  - Do NOT use "я впевнений", "I am confident", "I believe I can" — these signal weakness.
  - Do NOT use "з 10+ роками досвіду" as an opener — lead with proof, not years.
  - One concrete metric MUST appear in this paragraph."

Paragraph 2 — CORE MATCH (4–5 sentences):
  Address the top 3–4 JD requirements directly — one sentence each.
  Format per sentence: [JD keyword as natural phrase] + [specific proof with metric from profile].
  Do NOT list. Write flowing prose where each sentence lands like evidence.
  This paragraph is the heart. Make it dense with real facts.
  Draw from MULTIPLE positions in the profile — do not rely on a single company. Each sentence can reference a different job.

Paragraph 3 — AUTONOMY & FIT (2–3 sentences):
  Show the candidate fits the TEAM CULTURE described in the JD (remote, no micromanagement, ownership, etc.).
  Ground it in a real situation from the profile — not a generic claim.

Last line — CLOSE:
  One confident, forward-looking sentence. Then on a new line:
  "Regards,
  [First name] [Last name]"

### LENGTH
900–1400 characters total. Be sharp. Cut filler ruthlessly.

### EXAMPLE OF PERFECT OUTPUT
(This is a real example for an English-language Frontend/AI role. Use it as a style and structure reference — do NOT copy its content. Adapt fully to the actual JD and profile provided.)

---
Hello GetHired team,

My name is Andrew, and I'm excited about your Frontend Developer role.

You're looking for a developer who treats AI not as a buzzword to list on a resume, but as infrastructure to architect around. That's exactly what I do at GetHired.work - built the entire AI career platform from scratch on Next.js, where prompt orchestration, response streaming, and error handling are core to the architecture, not bolted on top.

On your stack: React and Next.js App Router have been my primary tools for 3+ years. At b0arding.com I led the full migration from Pages Router to App Router with React Server Components and a Redis caching layer, cutting page response times by 40% and pushing Core Web Vitals into the green. Performance isn't an afterthought - I hit Lighthouse 98/100 on mobile for a platform where 60% of traffic is mobile. On the AI side, I built a proprietary prompt abstraction layer that improved content quality by 45% and achieved 100% accuracy extracting structured data from LinkedIn PDFs.

I'm used to working without hand-holding - at GetHired.work I wear the hats of product owner, engineer, and prompt architect simultaneously, making and owning architectural decisions end to end.

Looking forward to connecting.

Regards,
Andrew Kupriyanov
---

### UKRAINIAN/RUSSIAN VOICE EXAMPLE
(Use this style when writing in Ukrainian or Russian — same structure as the English example above)

---
Привіт команді Panda Team,

Мене звати Andrew, і мене зацікавила ваша вакансія Front-end Developer (VueJS).

Vue, WebSockets, SSR - саме з цим я працював останні роки. У ReSpot з нуля побудував клієнтську частину SaaS-платформи на Vue ecosystem: складні UI-воркфлоу, майстри створення сервісів, інтеграція Stripe - і все це з повною адаптивністю під будь-який пристрій.

Vue та JavaScript - мій основний стек. WebSockets я використовував у b0arding.com для real-time чату на платформі бронювання, а SSR - там само, після міграції з Legacy React на Next.js, що скоротило час відповіді сторінок на 40%. З Webpack і Git працюю щодня, CSS-анімації впроваджував у GetHired.work - вони дали +25% до залученості користувачів.

Звик брати відповідальність за результат: у GetHired.work я одночасно product owner і engineer, приймаю архітектурні рішення самостійно і без мікроменеджменту.

Готовий обговорити деталі. Andrew Kupriyanov.
---

### FORBIDDEN
- Starting with "I", "Я", "Як розробник", "Мене звати"
- "I have extensive experience in..." or "Я маю великий досвід у..." without immediate specific proof
- "я впевнений, що зможу..." — never use this phrase, it signals insecurity
- Restating JD requirements without a matching profile fact
- Three paragraphs that all start with the same word or pattern
- Bullet points or dashes inside paragraphs
- Copying JD sentences verbatim
- Inventing any data not in the profile
- Any non-Latin/Cyrillic characters (no Chinese, Japanese, or other script contamination)`;

const BULLET_PROMPT = `You are a senior copywriter writing a bullet-format cover letter.

YOUR ONLY GOAL: produce a complete, scannable, evidence-packed cover letter that gives a recruiter proof of fit in under 30 seconds.

${SHARED_RULES}

---
## MANDATORY OUTPUT STRUCTURE — follow this EXACTLY, in this ORDER:

### BLOCK 1 — GREETING (one standalone line)
Extract the company name from the JD.
Format: "Hello [Company] team," / "Привіт команді [Company]," / "Здравствуйте, команда [Company],"
If no company name found: "Hello there," or language equivalent.

### BLOCK 2 — INTRODUCTION (one sentence, immediately after greeting)
Candidate introduces themselves by FIRST NAME ONLY and states interest in the exact job title from JD.
Examples:
- "My name is Andrew, and I'm excited about your Front-end Developer role."
- "Мене звати Андрій, і мене зацікавила ваша вакансія Front-end Developer (VueJS)."
- "Меня зовут Андрей, и я заинтересован в вашей вакансии Senior React Developer."

### BLOCK 3 — HOOK SENTENCE (one sentence)
Do NOT start with "I" or "Я".
Frame: what THEY are building + candidate's strongest credential with a concrete metric from profile.
Example: "Frontend for crypto exchanges and SaaS relocation platforms is my core focus: real-time trading charts at iCoinSoftware and a full Vue SaaS at ReSpot built from scratch."

### BLOCK 4 — BULLET LIST (MINIMUM 5 bullets, maximum 8)
This is the CORE of the letter. Do NOT skip or shorten this block.

For EACH bullet:
- Left side = JD requirement keyword (in JD language)
- Right side = past-tense action verb + specific proof from profile (company name OR metric)
- Format: "- [keyword]: [verb] [proof]"

BEFORE writing each bullet, check: "Is this technology/skill explicitly in the candidate profile?"
- YES → write the bullet with proof
- NO, but direct analogue exists → write bullet using analogue + one confident adoption phrase at the end
- NO analogue → skip entirely, write nothing

Analogue examples:
- JD wants Zustand, profile has Redux → "- State management: Redux Toolkit at b0arding.com — comfortable picking up Zustand"
- JD wants TanStack Query, profile has REST/Redux → "- Data fetching: REST API + Redux at b0arding.com — ready to adopt TanStack Query"

FORBIDDEN in bullets:
- "although not explicitly mentioned" / "similar to" / "transferable" — DELETE the whole bullet instead
- Any technology not in the profile, with no analogue

Order bullets by JD priority: most critical requirement first.

If the JD has "Nice to have" / "Буде плюсом" items that match the profile — add them as regular bullets at the end of the list (no special label).

### BLOCK 5 — CLOSING (mandatory, do NOT omit)
One confident forward-looking sentence.
New line: "Regards," (or language equivalent)
New line: "[First name] [Last name]"

---
## COMPLETE EXAMPLE (structure reference only — never copy content):

Hello GetHired team,

My name is Andrew, and I'm interested in your Frontend Developer position.

Frontend for AI-driven products is my core focus: at GetHired.work I built the entire platform from scratch, with AI pipelines and streaming as first-class architecture citizens.

- React / Next.js: led Pages→App Router migration at b0arding.com with Redis caching - response time down 40%
- AI integrations: built proprietary prompt abstraction layer at GetHired.work - +45% content quality, 100% accuracy parsing LinkedIn PDFs
- SSR / Performance: Lighthouse 98/100 on mobile, Core Web Vitals optimization at b0arding.com
- Tailwind / CSS: primary stack at GetHired.work and b0arding.com, responsive layouts for 60%+ mobile users
- API integrations: OpenAI, Claude, REST API, Stripe, WebSockets across three separate products
- Autonomy: product owner + engineer + prompt architect simultaneously, full ownership of architectural decisions

Looking forward to connecting.

Regards,
Andrew Kupriyanov

---
## SELF-CHECK BEFORE OUTPUTTING
Before you finish, verify:
[ ] Greeting line present
[ ] Introduction sentence present
[ ] Hook sentence present (does NOT start with I/Я)
[ ] At least 5 bullets present, each with concrete proof
[ ] Closing sentence present
[ ] "Regards, [Name]" present
If any item is missing — go back and add it. An incomplete letter is a failed output.`;

const TAILORED_RESUME_PROMPT = `You are an expert resume writer creating a SELLING, results-driven resume. Your task is to create a TAILORED resume in structured JSON format for a specific job posting.

### LANGUAGE ENFORCEMENT (ABSOLUTE PRIORITY)
- Identify the PRIMARY language of the Job Description (JD) text.
- The ENTIRE resume content MUST be in the JD's primary language.
- If the profile is in a different language, TRANSLATE all content to the JD language.

### FIX TYPOS IN JOB DESCRIPTION
- If the JD contains obvious typos in technology names, use the CORRECT spelling.

### HTML FORMATTING FOR EMPHASIS
You MUST use HTML tags to highlight key elements in "summary" and all "description" bullet points:
- <b>...</b> for: technology names, framework names, library names, tool names, company names, metrics/numbers, and key skill keywords that match the JD.
- <i>...</i> for: job-specific roles/titles the candidate held, domain terms, and soft-skill proof phrases.
- Rules:
  - Only wrap SHORT phrases or single words — never entire sentences.
  - Do NOT wrap filler words, articles, prepositions, or generic verbs like "worked", "helped".
  - Every bullet point MUST have at least 1 <b> tag.
  - The summary MUST have at least 3 <b> tags and 1 <i> tag.
  - Metrics (numbers with units) MUST always be wrapped in <b>: <b>40%</b>, <b>50K+ users</b>, <b>3 years</b>.
  - Technology names MUST always be wrapped in <b>: <b>React</b>, <b>Vue.js</b>, <b>Next.js</b>.
  - Company names MUST always be wrapped in <b>: <b>b0arding.com</b>, <b>GetHired.work</b>.
  - Do NOT add any other HTML tags — only <b> and <i> are allowed.

Examples of GOOD formatting:
  summary: "Frontend developer with <b>5+ years</b> of experience in <b>React</b> and <b>Vue.js</b>, specializing in <i>performance optimization</i> and <i>AI-powered products</i>. Built <b>GetHired.work</b> from scratch, reducing resume creation time by <b>85%</b>."
  description bullet: "Migrated <b>Pages Router</b> to <b>App Router</b> at <b>b0arding.com</b>, cutting page response times by <b>40%</b> and pushing <b>Core Web Vitals</b> into the green."
  description bullet: "Built <i>real-time trading charts</i> using <b>WebSockets</b> and <b>Vue 3</b> for <b>iCoinSoftware</b>, serving <b>10K+ daily active users</b>."

### KEY PRINCIPLES

1. **SELL, DON'T TELL**: Every bullet point must demonstrate VALUE and IMPACT.
   - BAD: "Worked on frontend development"
   - GOOD: "Developed <b>15+ React components</b> serving <b>50K+ daily users</b>, reducing page load time by <b>40%</b>"

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
   - ALL metrics MUST be wrapped in <b> tags.

5. **PROFESSIONAL SUMMARY**:
   - Write a powerful 2-3 sentence summary targeting the SPECIFIC role.
   - Include years of experience in the REQUIRED STACK (not total career).
   - Mention 2-3 key technologies from the JD.
   - If the most relevant stack experience comes from an older position, mention it prominently here — this compensates for it appearing lower in the chronological timeline.
   - Apply HTML formatting rules: at least 3 <b> tags and 1 <i> tag.

6. **SKILLS**:
   - List skills from the JD FIRST, but only if the candidate has them.
   - Add complementary skills from the profile.
   - Remove skills irrelevant to the role.
   - Use "technical", "soft", or "language" for category.
   - Use "beginner", "elementary", "intermediate", "advanced", or "expert" for level.

7. **ORDERING — CHRONOLOGICAL, STRICT**:
   - Sort work experience strictly by startDate DESCENDING (newest first). This is MANDATORY.
   - NEVER reorder positions to match JD relevance. Chronological order must always be preserved.
   - Pet projects (employmentType: pet_project) — always last, regardless of date.
   - Relevance is expressed ONLY through: rewritten descriptions with keyword-rich bullet points, and the professional summary. NOT by reordering companies.
   - If the most relevant experience (e.g. Vue.js) is at an older company — mention it prominently in the summary and rewrite that company's bullet points to highlight it. Do NOT move it up.
   - Preserve the employmentType value from the profile exactly as-is in the output JSON.
   - Example: Candidate has React job (current, 2023–present) and Vue job (2020–2022). JD requires Vue. CORRECT order: React job first (newer), Vue job second (older). Compensate by mentioning Vue prominently in summary.

### OUTPUT FORMAT
Return ONLY valid JSON (no markdown, no backticks, no explanation) with this exact structure:

{
  "personalInfo": { "firstName": "", "lastName": "", "email": "", "phone": "", "location": "", "website": "", "linkedin": "", "telegram": "", "summary": "2-3 powerful sentences with HTML <b> and <i> tags" },
  "workExperience": [{ "id": "we-1", "title": "", "company": "", "location": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM or empty", "current": false, "description": ["Achievement with <b>metric</b> and <b>tech</b>", "Another achievement"], "employmentType": "full_time or part_time or contract or pet_project" }],
  "education": [{ "id": "edu-1", "institution": "", "degree": "", "field": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "current": false }],
  "skills": [{ "id": "skill-1", "name": "", "category": "technical", "level": "advanced" }],
  "detectedLanguage": "ISO 639-1 code of the JD language (en, uk, ru, pl, de, etc.)",
  "targetPosition": "job title extracted from JD",
  "targetCompany": "company name extracted from JD"
}

### CRITICAL RULES
- Output ONLY the JSON object, nothing else.
- Use ONLY facts from the candidate profile. NEVER invent data.
- Each work experience "description" array should have 3-5 bullet points.
- Generate unique IDs for each item (use format like "we-1", "we-2", "edu-1", "skill-1", etc.).
- Keep only RELEVANT positions. Filter out unrelated jobs.
- Rewrite descriptions to maximize keyword matches and emphasize measurable results.
- workExperience MUST be sorted by startDate descending — no exceptions.
- IMPORTANT: Extract targetPosition and targetCompany from the Job Description ONLY. Do NOT use candidate experience for these fields.`;

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
      resumeLanguage = "en",
      profile: clientProfile,
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

    // Use profile from client store if provided, else fetch from DB
    let profile = clientProfile;
    if (!profile?.personalInfo && !profile?.workExperience?.length) {
      const dbProfile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      });
      profile = dbProfile;
    }

    if (!profile) {
      return NextResponse.json(
        { error: "No profile found. Please add your experience first." },
        { status: 400 },
      );
    }

    // Encode profile data as TOON for token efficiency
    const profileData = {
      personalInfo: profile.personalInfo ?? {},
      workExperience: profile.workExperience ?? [],
      education: profile.education ?? [],
      skills: profile.skills ?? [],
    };
    const profileToon = encode(profileData);

    const systemPrompt = format === "bullet" ? BULLET_PROMPT : PROSE_PROMPT;

    const userPrompt = `=== JOB DESCRIPTION ===
${jobDescription}

=== CANDIDATE PROFILE (source of ALL facts — use specific numbers, company names, years) ===
${profileToon}

IMPORTANT: Detect the PRIMARY language of the Job Description above. Write the ENTIRE cover letter in THAT language. If the profile is in a different language, translate the facts to the JD language.
IMPORTANT: Output a COMPLETE letter. Do NOT stop early. Every block is mandatory — if closing 'Regards, [Name]' is missing, the output is wrong.
Write the cover letter now. Use ONLY facts from the profile above.`;

    const response = await aiComplete(
      {
        systemPrompt,
        userPrompt,
        temperature: 0.3,
        maxTokens: 8000,
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
      const languageInstruction =
        resumeLanguage === "jd"
          ? `Detect the PRIMARY language of the Job Description above. Write the ENTIRE resume content (summary, descriptions, skills, job titles) in THAT language. If the profile is in a different language, TRANSLATE all content to the JD language. Include the detected language as "detectedLanguage" in the output JSON (ISO 639-1 code: en, uk, ru, pl, de, etc.).`
          : `Write the ENTIRE resume content (summary, descriptions, skills, job titles) in ENGLISH regardless of the JD or profile language. Translate all content to English if needed. Set "detectedLanguage" to "en" in the output JSON.`;

      const resumeUserPrompt = `=== JOB DESCRIPTION ===
${jobDescription}

=== CANDIDATE FULL PROFILE (source of ALL facts — use ONLY what is here) ===
${profileToon}

IMPORTANT: ${languageInstruction}
Create a tailored, selling resume now. Output ONLY valid JSON. Include ONLY relevant experience. Filter out unrelated jobs. Maximize keyword matches from the JD. Use metrics and numbers from the profile.
CRITICAL: Sort workExperience strictly by startDate DESCENDING (newest first). Do NOT reorder by relevance. Express relevance through the summary and rewritten bullet points only.
CRITICAL: Apply <b> and <i> HTML tags in summary and all description bullet points as instructed.`;

      const resumeResponse = await aiComplete(
        {
          systemPrompt: TAILORED_RESUME_PROMPT,
          userPrompt: resumeUserPrompt,
          temperature: 0.3,
          maxTokens: 12000,
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

        // Attempt to recover truncated JSON (e.g. MAX_TOKENS cut it mid-way)
        try {
          resumeJson = JSON.parse(content);
        } catch {
          // Find the last valid closing brace and try to close the JSON
          const lastBrace = content.lastIndexOf("}");
          if (lastBrace !== -1) {
            const truncated = content.slice(0, lastBrace + 1);
            // Count unclosed brackets/braces and close them
            let fixed = truncated;
            const openArrays =
              (fixed.match(/\[/g) || []).length -
              (fixed.match(/\]/g) || []).length;
            const openObjects =
              (fixed.match(/{/g) || []).length -
              (fixed.match(/}/g) || []).length;
            for (let i = 0; i < openArrays; i++) fixed += "]";
            for (let i = 0; i < openObjects; i++) fixed += "}";
            resumeJson = JSON.parse(fixed);
            console.warn("[AI] Resume JSON was truncated and auto-recovered");
          } else {
            throw new Error("No valid JSON structure found");
          }
        }
      } catch (err) {
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
          language: resumeJson.detectedLanguage || "en",
          personalInfo: resumeJson.personalInfo || {},
          workExperience: resumeJson.workExperience || [],
          education: resumeJson.education || [],
          skills: resumeJson.skills || [],
          certificates: resumeJson.certificates || [],
          targetPosition: resumeJson.targetPosition || null,
          targetCompany: resumeJson.targetCompany || null,
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
