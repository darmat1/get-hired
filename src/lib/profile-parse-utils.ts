// Utilities for profile text parsing, chunking and merging.
// Extracted here so they can be unit-tested independently from the API route.

// --- Token estimation & chunking ---

/** Rough token estimate: ~3.5 chars per token for English, ~2.5 for mixed/Cyrillic */
export function estimateTokens(text: string): number {
  const nonAsciiRatio =
    (text.match(/[^\x00-\x7F]/g)?.length ?? 0) / (text.length || 1);
  const charsPerToken = nonAsciiRatio > 0.3 ? 2.5 : 3.5;
  return Math.ceil(text.length / charsPerToken);
}

/**
 * Split text into chunks on paragraph / section boundaries.
 * Each chunk stays under `maxTokens` (estimated).
 */
export function splitTextIntoChunks(text: string, maxTokens: number): string[] {
  const totalTokens = estimateTokens(text);
  if (totalTokens <= maxTokens) return [text];

  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    const candidateChunk = currentChunk ? currentChunk + "\n\n" + para : para;
    if (estimateTokens(candidateChunk) > maxTokens && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk = candidateChunk;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // Safety: if a single paragraph is huge, force-split by characters
  const result: string[] = [];
  for (const chunk of chunks) {
    if (estimateTokens(chunk) <= maxTokens) {
      result.push(chunk);
    } else {
      const approxCharsPerChunk = maxTokens * 3;
      for (let i = 0; i < chunk.length; i += approxCharsPerChunk) {
        result.push(chunk.slice(i, i + approxCharsPerChunk).trim());
      }
    }
  }

  return result.filter(Boolean);
}

// --- Text cleaning ---

export function cleanResumeText(input: string): string {
  let text = input;
  text = text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "");

  // Fix spaced out text "S e n i o r" -> "Senior" (common in scanned PDFs)
  const spacingPattern = /(?:[A-Za-z]\s{1,2}){2,}[A-Za-z]/g;
  text = text.replace(spacingPattern, (match) => match.replace(/\s+/g, ""));

  return text
    .replace(/[•●▪◦▸►→✓✔]/g, "-")
    .replace(/[^\S\n]{3,}/g, "  ")
    .replace(/\n{4,}/g, "\n\n")
    .trim();
}

// --- Merge utilities ---

const safeStr = (val: unknown) => (typeof val === "string" ? val : "");

export function mergePersonalInfo(existing: Record<string, unknown>, parsed: Record<string, unknown>): Record<string, string> {
  const fields = [
    "firstName", "lastName", "email", "phone",
    "location", "summary", "linkedin", "telegram",
  ];
  const result: Record<string, string> = {};
  for (const field of fields) {
    const newVal = safeStr(parsed?.[field]);
    const oldVal = safeStr(existing?.[field]);
    result[field] = newVal || oldVal;
  }
  return result;
}

export function normalizeLevel(level: string): string {
  const l = (level || "").toLowerCase();
  if (l.includes("native") || l.includes("bilingual")) return "native";
  if (l.includes("full professional") || l.includes("fluent")) return "fluent";
  if (l.includes("professional working") || l.includes("proficient")) return "proficient";
  if (l.includes("limited working")) return "elementary";
  if (l.includes("elementary")) return "elementary";
  if (l.includes("beginner")) return "beginner";
  if (l.includes("advanced")) return "advanced";
  if (l.includes("intermediate")) {
    if (l.includes("upper")) return "upper-intermediate";
    if (l.includes("pre")) return "pre-intermediate";
    return "intermediate";
  }
  if (l.includes("expert")) return "expert";
  return level || "advanced";
}

export interface WorkExp {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  mainDescription?: string;
  description?: string | string[];
  [key: string]: unknown;
}

export function mergeWorkExperience(existing: WorkExp[], parsed: WorkExp[]): WorkExp[] {
  const normalize = (exp: WorkExp) => ({
    id: exp.id || crypto.randomUUID(),
    title: exp.title || "Position",
    company: exp.company || "Company",
    location: exp.location || "",
    startDate: exp.startDate || "",
    endDate: exp.endDate || "",
    current: !!exp.current,
    mainDescription: safeStr(exp.mainDescription),
    description: Array.isArray(exp.description)
      ? exp.description
      : [safeStr(exp.description)],
  });

  const key = (exp: WorkExp) =>
    `${(exp.company || "").toLowerCase()}::${(exp.title || "").toLowerCase()}`;

  const seen = new Map<string, ReturnType<typeof normalize>>();
  for (const exp of existing) seen.set(key(exp), normalize(exp));

  for (const exp of parsed) {
    const k = key(exp);
    if (!seen.has(k)) {
      seen.set(k, normalize(exp));
    } else {
      const old = seen.get(k)!;
      const newNorm = normalize(exp);
      if (
        newNorm.description.length > old.description.length ||
        (newNorm.mainDescription && !old.mainDescription)
      ) {
        seen.set(k, { ...newNorm, id: old.id });
      }
    }
  }
  return Array.from(seen.values());
}

export interface Education {
  id?: string;
  institution?: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  [key: string]: unknown;
}

export function mergeEducation(existing: Education[], parsed: Education[]): Education[] {
  const normalize = (edu: Education) => ({
    id: edu.id || crypto.randomUUID(),
    institution: edu.institution || "Institution",
    degree: edu.degree || "",
    field: edu.field || "",
    startDate: edu.startDate || "",
    endDate: edu.endDate || "",
    current: !!edu.current,
  });

  const key = (edu: Education) =>
    `${(edu.institution || "").toLowerCase()}::${(edu.degree || "").toLowerCase()}`;

  const seen = new Map<string, ReturnType<typeof normalize>>();
  for (const edu of existing) seen.set(key(edu), normalize(edu));
  for (const edu of parsed) {
    const k = key(edu);
    if (!seen.has(k)) seen.set(k, normalize(edu));
  }
  return Array.from(seen.values());
}

export interface Skill {
  id?: string;
  name?: string;
  category?: string;
  level?: string;
  [key: string]: unknown;
}

export function mergeSkills(existing: (Skill | string)[], parsed: (Skill | string)[]): Skill[] {
  const normalize = (skill: Skill | string) => ({
    id: (typeof skill === "string" ? undefined : skill.id) || crypto.randomUUID(),
    name: typeof skill === "string" ? skill : skill.name,
    category: (typeof skill === "string" ? undefined : skill.category) || "technical",
    level: normalizeLevel(typeof skill === "string" ? "" : (skill.level || "")),
  });

  const seen = new Map<string, ReturnType<typeof normalize>>();
  for (const skill of existing) {
    const n = normalize(skill);
    seen.set((n.name || "").toLowerCase(), n);
  }
  for (const skill of parsed) {
    const n = normalize(skill);
    const k = (n.name || "").toLowerCase();
    if (!seen.has(k)) seen.set(k, n);
  }
  return Array.from(seen.values());
}
