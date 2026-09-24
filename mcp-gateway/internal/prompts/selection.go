// PARITY: src/lib/agent/resume-generation.ts (buildSelectionPrompt) — keep in sync, see mcp-gateway/PARITY.md
package prompts

import (
	"bytes"
	"encoding/json"
	"fmt"
)

// Selection builds the AI prompt used to select relevant work experience and
// skills for resume generation. It is a verbatim port of buildSelectionPrompt
// from src/lib/agent/resume-generation.ts.
//
// profile must have the same shape as the TS profile argument:
//
//	{ personalInfo, workExperience, education, skills }
//
// jobDescription is optional; pass "" to get the "general resume" variant.
func Selection(profile map[string]any, targetRole string, jobDescription string) string {
	// Re-serialize the profile to JSON preserving the TS JSON.stringify key order.
	// TS JSON.stringify preserves insertion order; Go map[string]any loses it.
	// We reconstruct the JSON manually with canonical field ordering.
	profileText := marshalSelectionProfile(profile)

	var context string
	if jobDescription != "" {
		context = fmt.Sprintf("Create a resume for the following job:\n\n%s\n\n", jobDescription)
	} else {
		context = fmt.Sprintf("Create a general resume for the target role: %q\n\n", targetRole)
	}

	return context + `Given the candidate's profile below, select the most relevant experience and skills.

Profile (JSON):
` + profileText + `

Return ONLY valid JSON with this exact shape:
{
  "title": "<concise resume title, e.g. 'Senior React Developer — Acme Corp' or 'Senior React Developer Resume'>",
  "selectedExpIds": ["<id of relevant work experience>"],
  "selectedSkillNames": ["<name of relevant skill>"]
}

Rules:
- title: short, specific, max 60 chars
- selectedExpIds: IDs of work experience entries that are most relevant. Include at least 1, max all.
- selectedSkillNames: skill names from the profile that are relevant to the role/job. Include technical, language skills that match. Always include all language skills.
- Return ONLY JSON, no other text.`
}

// marshalSelectionProfile builds the JSON string for the profile in the exact
// key order that TS JSON.stringify({personalInfo, workExperience, education, skills})
// produces (insertion order of each sub-object).
func marshalSelectionProfile(profile map[string]any) string {
	var buf bytes.Buffer
	buf.WriteByte('{')

	// Top-level keys in TS insertion order: personalInfo, workExperience, education, skills
	topKeys := []string{"personalInfo", "workExperience", "education", "skills"}
	// Sub-object canonical key orders matching TS object literal insertion order in the profile.
	subOrders := map[string][]string{
		"personalInfo":   personalInfoKeys,
		"workExperience": workExpKeys,
		"education":      educationKeys,
		"skills":         skillKeys,
	}

	first := true
	for _, k := range topKeys {
		v, ok := profile[k]
		if !ok {
			continue
		}
		if !first {
			buf.WriteByte(',')
		}
		first = false
		keyJSON, _ := json.Marshal(k)
		buf.Write(keyJSON)
		buf.WriteByte(':')

		order := subOrders[k]
		switch k {
		case "personalInfo":
			if m, ok := v.(map[string]any); ok {
				writeOrderedObject(&buf, m, order)
			} else {
				writeJSON(&buf, v)
			}
		case "workExperience", "education", "skills":
			if arr, ok := v.([]any); ok {
				writeOrderedObjectArray(&buf, arr, order)
			} else {
				writeJSON(&buf, v)
			}
		default:
			writeJSON(&buf, v)
		}
	}

	buf.WriteByte('}')
	return buf.String()
}

// writeOrderedObject writes a JSON object to buf with keys in canonicalKeys order
// (present keys only), then any remaining keys that weren't in the canonical list.
func writeOrderedObject(buf *bytes.Buffer, m map[string]any, canonicalKeys []string) {
	buf.WriteByte('{')
	seen := make(map[string]bool)
	first := true
	for _, k := range canonicalKeys {
		v, ok := m[k]
		if !ok {
			continue
		}
		seen[k] = true
		if !first {
			buf.WriteByte(',')
		}
		first = false
		keyJSON, _ := json.Marshal(k)
		buf.Write(keyJSON)
		buf.WriteByte(':')
		writeJSON(buf, v)
	}
	// Append remaining keys not in canonical order (TS includes all keys from the object).
	for k, v := range m {
		if seen[k] {
			continue
		}
		if !first {
			buf.WriteByte(',')
		}
		first = false
		keyJSON, _ := json.Marshal(k)
		buf.Write(keyJSON)
		buf.WriteByte(':')
		writeJSON(buf, v)
	}
	buf.WriteByte('}')
}

// writeOrderedObjectArray writes a JSON array of objects, each with keys in canonicalKeys order.
func writeOrderedObjectArray(buf *bytes.Buffer, arr []any, canonicalKeys []string) {
	buf.WriteByte('[')
	for i, item := range arr {
		if i > 0 {
			buf.WriteByte(',')
		}
		if m, ok := item.(map[string]any); ok {
			writeOrderedObject(buf, m, canonicalKeys)
		} else {
			writeJSON(buf, item)
		}
	}
	buf.WriteByte(']')
}

// writeJSON writes any value as JSON to buf.
func writeJSON(buf *bytes.Buffer, v any) {
	b, _ := json.Marshal(v)
	buf.Write(b)
}
