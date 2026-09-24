package ai

import (
	"reflect"
	"testing"
)

func TestParseJSONResponse(t *testing.T) {
	cases := []struct {
		name    string
		input   string
		want    any
		wantErr bool
	}{
		{
			name:  "plain json object",
			input: `{"hello": "world"}`,
			want:  map[string]any{"hello": "world"},
		},
		{
			name:  "markdown code block",
			input: "Here is your JSON:\n```json\n{\"hello\": \"world\"}\n```\nHope it helps!",
			want:  map[string]any{"hello": "world"},
		},
		{
			name:  "trailing content outside braces",
			input: `{"hello": "world"} trailing junk`,
			want:  map[string]any{"hello": "world"},
		},
		{
			// No "}" at all → TS throws.
			name:    "incomplete json object without closing brace",
			input:   `{"hello": "world", "nested": {"a": 1`,
			wantErr: true,
		},
		{
			// TS slices first "{" .. last "}" → only the first object survives.
			name:  "truncated array keeps first-to-last brace slice",
			input: `[{"hello": "world"}, {"hello": "there"`,
			want:  map[string]any{"hello": "world"},
		},
		{
			// Truncated after a nested "}" → recovery closes the outer object.
			name:  "recovery closes open objects",
			input: `{"a": {"b": 1}, "c": [1, 2`,
			want:  map[string]any{"a": map[string]any{"b": float64(1)}},
		},
		{
			name:    "invalid json no braces",
			input:   `just text`,
			wantErr: true,
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got, err := ParseJSONResponse(c.input)
			if (err != nil) != c.wantErr {
				t.Fatalf("err=%v, wantErr=%v", err, c.wantErr)
			}
			if !c.wantErr && !reflect.DeepEqual(got, c.want) {
				t.Fatalf("got %#v, want %#v", got, c.want)
			}
		})
	}
}
