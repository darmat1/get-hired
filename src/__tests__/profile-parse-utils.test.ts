import { describe, it, expect } from "vitest";
import {
  estimateTokens,
  splitTextIntoChunks,
  cleanResumeText,
  mergePersonalInfo,
  mergeWorkExperience,
  mergeEducation,
  mergeSkills,
  normalizeLevel,
} from "@/lib/profile-parse-utils";

// ─── estimateTokens ──────────────────────────────────────────────────────────

describe("estimateTokens", () => {
  it("returns 0 for empty string", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("uses ~3.5 chars/token for ASCII text", () => {
    const text = "Hello world this is a test sentence for token estimation";
    const result = estimateTokens(text);
    // 56 chars / 3.5 = 16
    expect(result).toBe(16);
  });

  it("uses ~2.5 chars/token for Cyrillic-heavy text", () => {
    const text = "Привет мир это тест для подсчета токенов в кириллице";
    const result = estimateTokens(text);
    // nonAsciiRatio > 0.3, so ~2.5 chars/token
    expect(result).toBe(Math.ceil(text.length / 2.5));
  });

  it("scales linearly with text length", () => {
    const short = "Hello world";
    const long = "Hello world".repeat(10);
    expect(estimateTokens(long)).toBeGreaterThan(estimateTokens(short));
  });
});

// ─── splitTextIntoChunks ─────────────────────────────────────────────────────

describe("splitTextIntoChunks", () => {
  it("returns single chunk when text fits within limit", () => {
    const text = "Short text that fits.";
    const chunks = splitTextIntoChunks(text, 1000);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(text);
  });

  it("splits on double newlines (paragraph boundaries)", () => {
    const para1 = "A".repeat(350 * 3); // ~350 tokens each
    const para2 = "B".repeat(350 * 3);
    const text = `${para1}\n\n${para2}`;
    const chunks = splitTextIntoChunks(text, 400);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks.every((c) => c.length > 0)).toBe(true);
  });

  it("force-splits huge single paragraphs by character count", () => {
    // One giant paragraph with no double newlines
    const text = "X".repeat(10000);
    const chunks = splitTextIntoChunks(text, 500);
    expect(chunks.length).toBeGreaterThan(1);
    // Each chunk should be within roughly the budget
    chunks.forEach((c) => {
      expect(estimateTokens(c)).toBeLessThanOrEqual(600);
    });
  });

  it("filters out empty chunks", () => {
    const text = "Paragraph one.\n\n\n\nParagraph two.";
    const chunks = splitTextIntoChunks(text, 100);
    expect(chunks.every((c) => c.trim().length > 0)).toBe(true);
  });

  it("preserves all content across chunks", () => {
    const para1 = "Alpha ".repeat(200);
    const para2 = "Beta ".repeat(200);
    const text = `${para1}\n\n${para2}`;
    const chunks = splitTextIntoChunks(text, 300);
    const rejoined = chunks.join(" ");
    expect(rejoined).toContain("Alpha");
    expect(rejoined).toContain("Beta");
  });
});

// ─── cleanResumeText ─────────────────────────────────────────────────────────

describe("cleanResumeText", () => {
  it("removes control characters without inserting spaces", () => {
    const text = "Hello\x01\x02World";
    expect(cleanResumeText(text)).toBe("HelloWorld");
  });

  it("fixes spaced-out ASCII characters from scanned PDFs", () => {
    expect(cleanResumeText("S e n i o r")).toBe("Senior");
    expect(cleanResumeText("J a v a S c r i p t")).toBe("JavaScript");
  });

  it("replaces bullet point characters with dashes", () => {
    const text = "• Item one\n● Item two\n▪ Item three";
    const result = cleanResumeText(text);
    expect(result).toContain("- Item one");
    expect(result).toContain("- Item two");
    expect(result).toContain("- Item three");
  });

  it("collapses excessive whitespace", () => {
    expect(cleanResumeText("word    word")).toBe("word  word");
  });

  it("collapses 4+ newlines to double newline", () => {
    expect(cleanResumeText("a\n\n\n\n\nb")).toBe("a\n\nb");
  });

  it("trims leading and trailing whitespace", () => {
    expect(cleanResumeText("  hello  ")).toBe("hello");
  });

  it("preserves normal text unchanged (except trim)", () => {
    const text = "John Doe\nSoftware Engineer at Acme Corp\n2020-2024";
    expect(cleanResumeText(text)).toBe(text);
  });
});

// ─── mergePersonalInfo ───────────────────────────────────────────────────────

describe("mergePersonalInfo", () => {
  it("uses parsed values when they exist", () => {
    const result = mergePersonalInfo(
      { firstName: "Old", email: "old@example.com" },
      { firstName: "New", email: "new@example.com" },
    );
    expect(result.firstName).toBe("New");
    expect(result.email).toBe("new@example.com");
  });

  it("falls back to existing when parsed field is empty", () => {
    const result = mergePersonalInfo(
      { firstName: "Existing", phone: "+1234567890" },
      { firstName: "", phone: "" },
    );
    expect(result.firstName).toBe("Existing");
    expect(result.phone).toBe("+1234567890");
  });

  it("handles completely empty existing profile", () => {
    const result = mergePersonalInfo(
      {},
      { firstName: "Jane", lastName: "Doe" },
    );
    expect(result.firstName).toBe("Jane");
    expect(result.lastName).toBe("Doe");
  });

  it("returns empty strings for fields missing from both", () => {
    const result = mergePersonalInfo({}, {});
    expect(result.firstName).toBe("");
    expect(result.email).toBe("");
  });

  it("only includes known fields", () => {
    const result = mergePersonalInfo({}, { firstName: "A", unknownField: "X" });
    expect(result.firstName).toBe("A");
    expect("unknownField" in result).toBe(false);
  });
});

// ─── normalizeLevel ──────────────────────────────────────────────────────────

describe("normalizeLevel", () => {
  it.each([
    ["Native", "native"],
    ["Bilingual", "native"],
    ["Full Professional", "fluent"],
    ["Fluent", "fluent"],
    ["Professional Working", "proficient"],
    ["Proficient", "proficient"],
    ["Limited Working", "elementary"],
    ["Elementary", "elementary"],
    ["Beginner", "beginner"],
    ["Advanced", "advanced"],
    ["Upper Intermediate", "upper-intermediate"],
    ["Upper-Intermediate", "upper-intermediate"],
    ["Pre-Intermediate", "pre-intermediate"],
    ["Intermediate", "intermediate"],
    ["Expert", "expert"],
  ])("normalizes '%s' → '%s'", (input, expected) => {
    expect(normalizeLevel(input)).toBe(expected);
  });

  it("returns the input as-is for unknown levels (defaulting to advanced)", () => {
    expect(normalizeLevel("")).toBe("advanced");
    expect(normalizeLevel("Custom Level")).toBe("Custom Level");
  });
});

// ─── mergeWorkExperience ─────────────────────────────────────────────────────

describe("mergeWorkExperience", () => {
  const expA = {
    title: "Engineer",
    company: "Acme",
    startDate: "2020-01",
    endDate: "2022-06",
    current: false,
    description: ["Built things"],
  };

  it("combines non-overlapping entries", () => {
    const expB = { title: "Manager", company: "Beta Corp", description: [] };
    const result = mergeWorkExperience([expA], [expB]);
    expect(result).toHaveLength(2);
  });

  it("deduplicates by company+title (case-insensitive)", () => {
    const duplicate = { ...expA, company: "ACME", title: "ENGINEER" };
    const result = mergeWorkExperience([expA], [duplicate]);
    expect(result).toHaveLength(1);
  });

  it("prefers version with more description items", () => {
    const richer = { ...expA, description: ["Built things", "Led team", "Shipped product"] };
    const result = mergeWorkExperience([expA], [richer]);
    expect(result[0].description).toHaveLength(3);
  });

  it("preserves the original id on deduplication", () => {
    const withId = { ...expA, id: "original-id-123" };
    const parsed = { ...expA, description: ["More detail", "Even more"] };
    const result = mergeWorkExperience([withId], [parsed]);
    expect(result[0].id).toBe("original-id-123");
  });

  it("handles empty arrays", () => {
    expect(mergeWorkExperience([], [])).toEqual([]);
    expect(mergeWorkExperience([expA], [])).toHaveLength(1);
    expect(mergeWorkExperience([], [expA])).toHaveLength(1);
  });

  it("normalizes string description to array", () => {
    const withStringDesc = { ...expA, description: "Single string desc" as unknown as string[] };
    const result = mergeWorkExperience([], [withStringDesc]);
    expect(Array.isArray(result[0].description)).toBe(true);
  });

  it("sets default company/title when missing", () => {
    const result = mergeWorkExperience([], [{ description: [] }]);
    expect(result[0].company).toBe("Company");
    expect(result[0].title).toBe("Position");
  });
});

// ─── mergeEducation ──────────────────────────────────────────────────────────

describe("mergeEducation", () => {
  const eduA = {
    institution: "MIT",
    degree: "BSc",
    field: "Computer Science",
    startDate: "2016-09",
    endDate: "2020-05",
    current: false,
  };

  it("combines non-overlapping entries", () => {
    const eduB = { institution: "Harvard", degree: "MSc" };
    const result = mergeEducation([eduA], [eduB]);
    expect(result).toHaveLength(2);
  });

  it("deduplicates by institution+degree (case-insensitive)", () => {
    const duplicate = { ...eduA, institution: "mit", degree: "bsc" };
    const result = mergeEducation([eduA], [duplicate]);
    expect(result).toHaveLength(1);
  });

  it("does not overwrite existing with parsed duplicate", () => {
    const withId = { ...eduA, id: "edu-id-456" };
    const result = mergeEducation([withId], [eduA]);
    expect(result[0].id).toBe("edu-id-456");
  });

  it("handles empty arrays", () => {
    expect(mergeEducation([], [])).toEqual([]);
  });
});

// ─── mergeSkills ─────────────────────────────────────────────────────────────

describe("mergeSkills", () => {
  it("combines non-overlapping skills", () => {
    const result = mergeSkills(
      [{ name: "TypeScript", category: "technical", level: "advanced" }],
      [{ name: "React", category: "technical", level: "intermediate" }],
    );
    expect(result).toHaveLength(2);
  });

  it("deduplicates skills by name (case-insensitive)", () => {
    const result = mergeSkills(
      [{ name: "TypeScript", level: "advanced" }],
      [{ name: "typescript", level: "expert" }],
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("TypeScript");
  });

  it("accepts string skills and converts them", () => {
    const result = mergeSkills([], ["JavaScript", "Python"]);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("JavaScript");
    expect(result[0].category).toBe("technical");
  });

  it("normalizes skill levels", () => {
    const result = mergeSkills([], [{ name: "English", level: "Full Professional" }]);
    expect(result[0].level).toBe("fluent");
  });

  it("defaults category to technical", () => {
    const result = mergeSkills([], [{ name: "Git" }]);
    expect(result[0].category).toBe("technical");
  });

  it("handles empty arrays", () => {
    expect(mergeSkills([], [])).toEqual([]);
  });
});
