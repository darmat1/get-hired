export function parseAIJsonResponse<T>(content: string): T {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const lastValidBrace = cleaned.lastIndexOf("}");
    if (lastValidBrace === -1) {
      throw new Error("AI response did not contain valid JSON");
    }

    let recovered = cleaned.substring(0, lastValidBrace + 1);
    const openArrays =
      (recovered.match(/\[/g) || []).length -
      (recovered.match(/\]/g) || []).length;
    const openObjects =
      (recovered.match(/{/g) || []).length -
      (recovered.match(/}/g) || []).length;

    for (let i = 0; i < openArrays; i++) recovered += "]";
    for (let i = 0; i < openObjects; i++) recovered += "}";

    return JSON.parse(recovered) as T;
  }
}
