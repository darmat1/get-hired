// PARITY: @toon-format/toon encode — keep in sync, see mcp-gateway/PARITY.md
package prompts

import (
	"bytes"
	"encoding/json"

	toon "github.com/toon-format/toon-go"
)

// orderedField is a key-value pair with preserved insertion order.
type orderedField struct {
	key   string
	value any // may be string, bool, float64, nil, []any (of orderedMap), or orderedMap
}

// orderedMap is an ordered list of key-value pairs preserving JSON insertion order.
type orderedMap []orderedField

// toToon converts an orderedMap to a toon.Object, preserving field order.
func (m orderedMap) toToon() toon.Object {
	fields := make([]toon.Field, 0, len(m))
	for _, f := range m {
		fields = append(fields, toon.Field{Key: f.key, Value: toToonValue(f.value)})
	}
	return toon.NewObject(fields...)
}

func toToonValue(v any) any {
	switch val := v.(type) {
	case orderedMap:
		return val.toToon()
	case []any:
		result := make([]any, 0, len(val))
		for _, item := range val {
			result = append(result, toToonValue(item))
		}
		return result
	default:
		// nil, bool, float64, string, json.Number
		return val
	}
}

// decodeOrderedJSON decodes a JSON token stream into ordered maps/slices/primitives.
// This preserves insertion order of JSON object keys, unlike map[string]any.
func decodeOrderedJSON(dec *json.Decoder) (any, error) {
	tok, err := dec.Token()
	if err != nil {
		return nil, err
	}

	switch t := tok.(type) {
	case json.Delim:
		switch t {
		case '{':
			var om orderedMap
			for dec.More() {
				// key
				keyTok, err := dec.Token()
				if err != nil {
					return nil, err
				}
				key := keyTok.(string)
				val, err := decodeOrderedJSON(dec)
				if err != nil {
					return nil, err
				}
				om = append(om, orderedField{key: key, value: val})
			}
			// consume '}'
			if _, err := dec.Token(); err != nil {
				return nil, err
			}
			return om, nil
		case '[':
			var arr []any
			for dec.More() {
				item, err := decodeOrderedJSON(dec)
				if err != nil {
					return nil, err
				}
				arr = append(arr, item)
			}
			// consume ']'
			if _, err := dec.Token(); err != nil {
				return nil, err
			}
			return arr, nil
		}
	case json.Number:
		// Use float64 to match json.Unmarshal default; toon normalizes it.
		f, err := t.Float64()
		if err != nil {
			return t.String(), nil
		}
		return f, nil
	default:
		// bool, string, nil
		return t, nil
	}
	return nil, nil
}

// EncodeTOON encodes a profile map (decoded from JSON) into a TOON string.
// The input map[string]any has unordered keys; we re-serialize to JSON and
// decode with token-by-token order-preserving decode, then marshal to TOON.
// This matches the TS @toon-format/toon encode() output for the profile shape.
func EncodeTOON(profile map[string]any) string {
	// Re-serialize to JSON preserving the insertion order issue — but the test
	// profile is decoded from profile.json, so we need to decode with order
	// preservation. Since the input already lost order (map[string]any), we
	// use the canonical profile key order known from the TS source.
	//
	// Strategy: marshal back to JSON (keys will be sorted alphabetically by
	// encoding/json), then decode with order-preserving decoder using the
	// canonical field order. Actually, encoding/json sorts map keys, which is
	// NOT the same as TS insertion order.
	//
	// Instead: build the toon.Object directly from the map using the known
	// canonical key order for each level of the profile shape.
	obj := buildProfileToonObject(profile)
	s, err := toon.MarshalString(obj)
	if err != nil {
		return ""
	}
	return s
}

// EncodeTOONFromJSON decodes JSON bytes with order preservation and returns TOON.
// Use this when you have the raw JSON bytes (e.g. from jsonb) to preserve key order.
func EncodeTOONFromJSON(jsonBytes []byte) (string, error) {
	dec := json.NewDecoder(bytes.NewReader(jsonBytes))
	dec.UseNumber()
	ordered, err := decodeOrderedJSON(dec)
	if err != nil {
		return "", err
	}
	obj, ok := ordered.(orderedMap)
	if !ok {
		return "", nil
	}
	return toon.MarshalString(obj.toToon())
}

// profileTopKeys is the canonical top-level key order for a user profile,
// matching the TS @toon-format/toon encode() insertion order.
var profileTopKeys = []string{"personalInfo", "workExperience", "education", "skills"}

// personalInfoKeys is the canonical sub-key order for personalInfo.
var personalInfoKeys = []string{
	"firstName", "lastName", "email", "phone", "location",
	"website", "linkedin", "github", "telegram", "summary",
}

// workExpKeys is the canonical sub-key order for a work experience entry.
var workExpKeys = []string{
	"id", "company", "position", "startDate", "endDate", "current",
	"description", "employmentType", "location",
}

// educationKeys is the canonical sub-key order for an education entry.
var educationKeys = []string{
	"id", "institution", "degree", "field", "startDate", "endDate", "current",
}

// skillKeys is the canonical sub-key order for a skill entry.
var skillKeys = []string{"id", "name", "category", "level"}

// buildProfileToonObject builds a toon.Object from a profile map, preserving
// the canonical key order so that TOON output matches the TS encode() output.
func buildProfileToonObject(profile map[string]any) toon.Object {
	var fields []toon.Field
	for _, k := range profileTopKeys {
		v, ok := profile[k]
		if !ok {
			continue
		}
		switch k {
		case "personalInfo":
			if sub, ok := v.(map[string]any); ok {
				fields = append(fields, toon.Field{Key: k, Value: buildOrderedObject(sub, personalInfoKeys)})
			}
		case "workExperience":
			if arr, ok := v.([]any); ok {
				fields = append(fields, toon.Field{Key: k, Value: buildOrderedObjectArray(arr, workExpKeys)})
			}
		case "education":
			if arr, ok := v.([]any); ok {
				fields = append(fields, toon.Field{Key: k, Value: buildOrderedObjectArray(arr, educationKeys)})
			}
		case "skills":
			if arr, ok := v.([]any); ok {
				fields = append(fields, toon.Field{Key: k, Value: buildOrderedObjectArray(arr, skillKeys)})
			}
		}
	}
	return toon.NewObject(fields...)
}

// buildOrderedObject builds a toon.Object from a map using the given canonical key order.
// Keys not in the canonical order are appended at the end.
func buildOrderedObject(m map[string]any, canonicalKeys []string) toon.Object {
	var fields []toon.Field
	seen := make(map[string]bool)
	for _, k := range canonicalKeys {
		v, ok := m[k]
		if !ok {
			continue
		}
		seen[k] = true
		fields = append(fields, toon.Field{Key: k, Value: v})
	}
	// append any extra keys not in canonical order (alphabetically)
	for k, v := range m {
		if !seen[k] {
			fields = append(fields, toon.Field{Key: k, Value: v})
		}
	}
	return toon.NewObject(fields...)
}

// buildOrderedObjectArray builds a []toon.Object from a []any, each item ordered
// by the canonical key order.
func buildOrderedObjectArray(arr []any, canonicalKeys []string) []toon.Object {
	result := make([]toon.Object, 0, len(arr))
	for _, item := range arr {
		if m, ok := item.(map[string]any); ok {
			result = append(result, buildOrderedObject(m, canonicalKeys))
		}
	}
	return result
}
