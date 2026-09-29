package prompts

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func golden(t *testing.T, name string) string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join("testdata", name))
	if err != nil {
		t.Fatal(err)
	}
	return string(b)
}

func profile(t *testing.T) map[string]any {
	var p map[string]any
	if err := json.Unmarshal([]byte(golden(t, "profile.json")), &p); err != nil {
		t.Fatal(err)
	}
	return p
}

const jd = "Senior Go engineer. Build APIs, own Postgres performance."

func TestGolden(t *testing.T) {
	p := profile(t)
	toon := EncodeTOON(p)
	cases := map[string]string{
		"profile.toon.txt":        toon,
		"career_context.txt":      SharedCareerContext(),
		"cover_system_prose.txt":  CoverLetterSystem("prose"),
		"cover_system_bullet.txt": CoverLetterSystem("bullet"),
		"cover_user.txt":          CoverLetterUser(jd, toon),
		"tailored_system.txt":     TailoredResumeSystem(),
		"tailored_user.txt":       TailoredResumeUser(jd, toon, "en"),
		"selection_with_jd.txt":   Selection(p, "Backend Engineer", jd),
		"selection_no_jd.txt":     Selection(p, "Backend Engineer", ""),
	}
	for name, got := range cases {
		if want := golden(t, name); got != want {
			t.Errorf("%s differs from TS output.\n--- want\n%s\n--- got\n%s", name, want, got)
		}
	}
}
