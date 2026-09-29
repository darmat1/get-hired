// PARITY: src/lib/ai/parse-json-response.ts, src/lib/ai/structured-output.ts — keep in sync, see mcp-gateway/PARITY.md
package ai

import (
	"encoding/json"
	"errors"
	"regexp"
	"strings"
)

var (
	reCodeStart = regexp.MustCompile(`(?i)^.*?` + "```" + `(?:json)?\s*`)
	reCodeEnd   = regexp.MustCompile(`(?i)\s*` + "```" + `.*?$`)
)

func ParseJSONResponse(content string) (any, error) {
	cleaned := strings.TrimSpace(content)

	// TS does replace(/^```(?:json)?\s*/i, ""). replace(/\s*```$/i, "")
	// but it also has a test "markdown code block" with "Here is your JSON:\n```json..."
	// Wait, TS replace(/^```/i) wouldn't match if there's text before it!
	// But then it does indexOf("{") which WOULD find the first brace.
	// So we don't need to overcomplicate the regexes, the substring will handle leading text.
	cleaned = regexp.MustCompile(`(?i)^`+"```"+`(?:json)?\s*`).ReplaceAllString(cleaned, "")
	cleaned = regexp.MustCompile(`(?i)\s*`+"```"+`$`).ReplaceAllString(cleaned, "")

	firstBrace := strings.Index(cleaned, "{")
	lastBrace := strings.LastIndex(cleaned, "}")

	if firstBrace != -1 && lastBrace != -1 && lastBrace >= firstBrace {
		cleaned = cleaned[firstBrace : lastBrace+1]
	}

	var res any
	err := json.Unmarshal([]byte(cleaned), &res)
	if err == nil {
		return res, nil
	}

	lastValidBrace := strings.LastIndex(cleaned, "}")
	if lastValidBrace == -1 {
		return nil, errors.New("AI response did not contain valid JSON")
	}

	recovered := cleaned[:lastValidBrace+1]
	openArrays := strings.Count(recovered, "[") - strings.Count(recovered, "]")
	openObjects := strings.Count(recovered, "{") - strings.Count(recovered, "}")

	for i := 0; i < openArrays; i++ {
		recovered += "]"
	}
	for i := 0; i < openObjects; i++ {
		recovered += "}"
	}

	err = json.Unmarshal([]byte(recovered), &res)
	if err != nil {
		return nil, err
	}
	return res, nil
}
