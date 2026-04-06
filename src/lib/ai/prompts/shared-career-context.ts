import { renderJobArchetypesForPrompt } from "./job-archetypes";

export const CAREER_SOURCES_OF_TRUTH = `### SOURCES OF TRUTH
- The candidate profile provided in the prompt is the only allowed source of candidate facts.
- Use exact numbers, dates, companies, titles, technologies, and achievements only if they are explicitly present in the candidate profile.
- If a fact is missing, omit it. Never fill gaps with assumptions.`;

export const CAREER_DATA_INTEGRITY_RULES = `### DATA INTEGRITY
- Never invent numbers, companies, projects, technologies, dates, certifications, or team sizes.
- Never claim total years of experience unless that total can be derived from the provided profile.
- Before mentioning any library, framework, methodology, or tool, verify it exists in skills or work experience.
- If a JD requirement has no supporting evidence in the profile, do not mention it.
- Silence is better than a lie.`;

export const JD_LANGUAGE_AND_EXTRACTION_RULES = `### JD ANALYSIS
- Detect the primary language from the JD body, not from the job title, UI chrome, or technology names.
- Ignore navigation words, buttons, and interface labels when deciding language.
- Extract the company name and exact job title from the JD when present.
- Identify the 5-8 most important requirements and separate must-haves from nice-to-haves.
- Silently fix obvious typos in technology names from the JD.`;

export const JOB_ARCHETYPE_RULES = `### JOB ARCHETYPE DETECTION
Classify the role into the closest archetype before writing:
${renderJobArchetypesForPrompt()}

- Use the detected archetype to decide which proof points to prioritize.
- If the role is hybrid, bias toward the archetype that best explains what the employer is buying.
- When the JD signals ownership, builder mindset, entrepreneurial execution, end-to-end delivery, or autonomy, increase the weight of founder-style proof points if they are present in the candidate profile.`;

export const CAREER_STYLE_RULES = `### STYLE
- Be direct, specific, and recruiter-useful.
- Prefer short sentences with strong verbs.
- Do not use generic corporate filler.
- Every sentence should either prove fit, reduce risk, or clarify relevance.`;

export function buildSharedCareerContext(): string {
  return [
    CAREER_SOURCES_OF_TRUTH,
    CAREER_DATA_INTEGRITY_RULES,
    JD_LANGUAGE_AND_EXTRACTION_RULES,
    JOB_ARCHETYPE_RULES,
    CAREER_STYLE_RULES,
  ].join("\n\n");
}
