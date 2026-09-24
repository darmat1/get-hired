// PARITY: src/lib/ai/prompts/shared-career-context.ts
package prompts

import "strings"

const CareerSourcesOfTruth = `### SOURCES OF TRUTH
- The candidate profile provided in the prompt is the only allowed source of candidate facts.
- Use exact numbers, dates, companies, titles, technologies, and achievements only if they are explicitly present in the candidate profile.
- If a fact is missing, omit it. Never fill gaps with assumptions.`

const CareerDataIntegrityRules = `### DATA INTEGRITY
- Never invent numbers, companies, projects, technologies, dates, certifications, or team sizes.
- Never claim total years of experience unless that total can be derived from the provided profile.
- Before mentioning any library, framework, methodology, or tool, verify it exists in skills or work experience.
- If a JD requirement has no supporting evidence in the profile, do not mention it.
- Silence is better than a lie.`

const JdLanguageAndExtractionRules = `### JD ANALYSIS
- Detect the primary language from the JD body, not from the job title, UI chrome, or technology names.
- Ignore navigation words, buttons, and interface labels when deciding language.
- Extract the company name and exact job title from the JD when present.
- Identify the 5-8 most important requirements and separate must-haves from nice-to-haves.
- Silently fix obvious typos in technology names from the JD.`

func JobArchetypeRules() string {
	return `### JOB ARCHETYPE DETECTION
Classify the role into the closest archetype before writing:
` + RenderJobArchetypesForPrompt() + `

- Use the detected archetype to decide which proof points to prioritize.
- If the role is hybrid, bias toward the archetype that best explains what the employer is buying.
- When the JD signals ownership, builder mindset, entrepreneurial execution, end-to-end delivery, or autonomy, increase the weight of founder-style proof points if they are present in the candidate profile.`
}

const CareerStyleRules = `### STYLE
- Be direct, specific, and recruiter-useful.
- Prefer short sentences with strong verbs.
- Do not use generic corporate filler.
- Every sentence should either prove fit, reduce risk, or clarify relevance.`

func SharedCareerContext() string {
	return strings.Join([]string{
		CareerSourcesOfTruth,
		CareerDataIntegrityRules,
		JdLanguageAndExtractionRules,
		JobArchetypeRules(),
		CareerStyleRules,
	}, "\n\n")
}
