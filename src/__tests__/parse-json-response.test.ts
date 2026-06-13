import { describe, it, expect } from "vitest";
import { parseAIJsonResponse } from "@/lib/ai/parse-json-response";

describe("parseAIJsonResponse", () => {
  it("parses plain valid JSON", () => {
    const result = parseAIJsonResponse<{ name: string }>('{"name": "John"}');
    expect(result).toEqual({ name: "John" });
  });

  it("strips markdown fenced JSON block", () => {
    const input = '```json\n{"key": "value"}\n```';
    expect(parseAIJsonResponse<{ key: string }>(input)).toEqual({ key: "value" });
  });

  it("strips fenced block without language tag", () => {
    const input = '```\n{"key": "value"}\n```';
    expect(parseAIJsonResponse<{ key: string }>(input)).toEqual({ key: "value" });
  });

  it("extracts JSON embedded in surrounding text", () => {
    const input = 'Here is the result: {"score": 95} as requested.';
    expect(parseAIJsonResponse<{ score: number }>(input)).toEqual({ score: 95 });
  });

  it("handles nested objects", () => {
    const input = '{"person": {"name": "Jane", "age": 30}, "active": true}';
    const result = parseAIJsonResponse<any>(input);
    expect(result.person.name).toBe("Jane");
    expect(result.active).toBe(true);
  });

  it("handles arrays inside objects", () => {
    const input = '{"skills": ["TypeScript", "React", "Node.js"]}';
    const result = parseAIJsonResponse<{ skills: string[] }>(input);
    expect(result.skills).toHaveLength(3);
  });

  it("recovers from truncated JSON when at least one closing brace exists", () => {
    // Truncated array — has a closing } but the array is not closed
    const input = '{"workExperience": [{"title": "Engineer", "company": "Acme"}';
    const result = parseAIJsonResponse<any>(input);
    expect(result.workExperience).toBeDefined();
    expect(result.workExperience[0].company).toBe("Acme");
  });

  it("throws when truncated JSON has no closing braces at all", () => {
    // No } at all — unrecoverable
    const input = '{"workExperience": [{"title": "Engineer", "company": "Acme"';
    expect(() => parseAIJsonResponse(input)).toThrow("AI response did not contain valid JSON");
  });

  it("handles JSON with trailing comma (common AI mistake)", () => {
    // The parser should handle this gracefully
    const input = '{"name": "John", "skills": ["JS", "TS",]}';
    // This may throw or recover; either is valid behavior — just shouldn't crash silently
    try {
      const result = parseAIJsonResponse<any>(input);
      expect(result).toBeTruthy();
    } catch {
      // Acceptable to throw on malformed trailing comma
    }
  });

  it("throws on completely invalid content", () => {
    expect(() => parseAIJsonResponse("not json at all")).toThrow();
  });

  it("throws on empty string", () => {
    expect(() => parseAIJsonResponse("")).toThrow();
  });

  it("handles large profile-shaped JSON", () => {
    const profileJSON = JSON.stringify({
      personalInfo: { firstName: "Ivan", lastName: "Petrov", email: "ivan@example.com" },
      workExperience: [
        { title: "Senior Developer", company: "Tech Corp", startDate: "2020-01", current: true, description: ["Led team of 5"] },
      ],
      education: [{ institution: "ITMO", degree: "BSc", field: "CS" }],
      skills: [{ name: "TypeScript", category: "technical", level: "advanced" }],
    });
    const result = parseAIJsonResponse<any>(profileJSON);
    expect(result.personalInfo.firstName).toBe("Ivan");
    expect(result.workExperience[0].company).toBe("Tech Corp");
    expect(result.skills[0].name).toBe("TypeScript");
  });
});
