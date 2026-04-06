export function buildAutoPostGenerationPrompt(subjectDisplayName: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt: `Return only valid JSON:
{
  "title": "string",
  "hook": "string",
  "body": "string",
  "conclusion": "string"
}

Rules:
- hook must be under 50 characters.
- body must be under 300 characters and at least 200 characters.
- conclusion must be under 50 characters.
- Write a concise technical status update with a sharp, internet-native tone.
- No markdown. No extra keys. No explanations.`,
    userPrompt: `Generate a technical status about ${subjectDisplayName}.`,
  };
}

export function buildAutoPostVerificationPrompt(
  verificationPayload: string,
): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt: `You are a precise mathematical solver.

CRITICAL RULES:
1. Ignore noisy strings like "lO", "l0", "O", or "o" when they are clearly part of words rather than numbers.
2. Only use numbers written as words or clear digits that are relevant to the final question.
3. Ignore flavor text and isolate only the values needed for the total.
4. Return only valid JSON:
{
  "reasoning": "string",
  "solution": "00.00"
}
5. solution must be a numeric string with exactly 2 decimal places.`,
    userPrompt: `Solve this verification challenge: ${verificationPayload}`,
  };
}
