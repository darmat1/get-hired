// PARITY: src/lib/agent/resume-generation.ts, src/lib/agent/cover-letter-generation.ts — keep in sync, see mcp-gateway/PARITY.md
package gen_test

import (
	"context"
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/lucsky/cuid"

	"mcp-gateway/internal/ai"
	"mcp-gateway/internal/db"
	"mcp-gateway/internal/gen"
	"mcp-gateway/internal/prompts"
	"mcp-gateway/internal/store"
)

// fakeCompleter is a stub AI Completer for tests.
type fakeCompleter struct {
	content string
	err     error
	lastReq ai.Request
}

func (f *fakeCompleter) Complete(_ context.Context, req ai.Request, _ string) (ai.Response, error) {
	f.lastReq = req
	if f.err != nil {
		return ai.Response{}, f.err
	}
	return ai.Response{Content: f.content, Provider: "fake", Model: "fake"}, nil
}

// selectionJSON is a canned AI response for resume selection.
const selectionJSON = `{"title":"Backend Engineer Resume","selectedExpIds":["exp1"],"selectedSkillNames":["Go","PostgreSQL"]}`

// coverLetterText is a canned AI response for cover letter generation.
const coverLetterText = "Dear Hiring Manager,\n\nI am excited to apply.\n\nRegards,\nAnn Lee"

func TestResumeGeneration(t *testing.T) {
	pool := db.ForTest(t)
	ctx := context.Background()

	userID := cuid.New()
	_, err := pool.Exec(ctx, `INSERT INTO "user"(id,email,"updatedAt") VALUES($1,$2,now())`, userID, userID+"@t.dev")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { pool.Exec(ctx, `DELETE FROM "user" WHERE id=$1`, userID) })

	// Insert profile with work experience that has an id.
	profile := map[string]any{
		"personalInfo": map[string]any{"firstName": "Ann", "lastName": "Lee", "email": "ann@example.com"},
		"workExperience": []any{
			map[string]any{"id": "exp1", "company": "Acme", "position": "Engineer", "startDate": "2021-01", "endDate": "", "current": true, "description": "Go work"},
			map[string]any{"id": "exp2", "company": "OldCo", "position": "Junior", "startDate": "2019-01", "endDate": "2020-12", "current": false, "description": "Old work"},
		},
		"education": []any{},
		"skills": []any{
			map[string]any{"id": "sk1", "name": "Go", "category": "technical", "level": "advanced"},
			map[string]any{"id": "sk2", "name": "PostgreSQL", "category": "technical", "level": "advanced"},
			map[string]any{"id": "sk3", "name": "English", "category": "language", "level": "fluent"},
		},
	}
	profileJSON, _ := json.Marshal(profile)
	profID := cuid.New()
	_, err = pool.Exec(ctx,
		`INSERT INTO user_profile(id,"userId","personalInfo","workExperience","education","skills","certificates","updatedAt")
		 VALUES($1,$2,$3::jsonb,$4::jsonb,'[]'::jsonb,$5::jsonb,'[]'::jsonb,now())`,
		profID, userID,
		mustJSON(profile["personalInfo"]),
		mustJSON(profile["workExperience"]),
		mustJSON(profile["skills"]),
	)
	if err != nil {
		t.Fatal("insert profile:", err)
	}
	_ = profileJSON

	fake := &fakeCompleter{content: selectionJSON}
	g := &gen.Gen{
		Store: &store.Store{Pool: pool},
		AI:    fake,
	}

	resumeID, title, err := g.Resume(ctx, userID, gen.ResumeOpts{
		TargetRole:     "Backend Engineer",
		JobDescription: "Build Go APIs",
		Template:       "professional",
	})
	if err != nil {
		t.Fatalf("Resume() error: %v", err)
	}
	if resumeID == "" || title == "" {
		t.Fatalf("empty resumeID or title: %q %q", resumeID, title)
	}

	// Verify row exists with source='agent'.
	var source string
	if err := pool.QueryRow(ctx, `SELECT source FROM "Resume" WHERE id=$1 AND "userId"=$2`, resumeID, userID).Scan(&source); err != nil {
		t.Fatalf("Resume row not found: %v", err)
	}
	if source != "agent" {
		t.Fatalf("source=%q want 'agent'", source)
	}

	// Verify selected experience is filtered (only exp1 selected).
	var weJSON []byte
	if err := pool.QueryRow(ctx, `SELECT "workExperience" FROM "Resume" WHERE id=$1`, resumeID).Scan(&weJSON); err != nil {
		t.Fatal(err)
	}
	var we []map[string]any
	if err := json.Unmarshal(weJSON, &we); err != nil {
		t.Fatal(err)
	}
	if len(we) != 1 || we[0]["id"] != "exp1" {
		t.Fatalf("wrong workExperience: %+v", we)
	}
}

func TestResumeGenerationLimit(t *testing.T) {
	pool := db.ForTest(t)
	ctx := context.Background()

	userID := cuid.New()
	if _, err := pool.Exec(ctx, `INSERT INTO "user"(id,email,"updatedAt") VALUES($1,$2,now())`, userID, userID+"@t.dev"); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { pool.Exec(ctx, `DELETE FROM "user" WHERE id=$1`, userID) })

	profID := cuid.New()
	if _, err := pool.Exec(ctx,
		`INSERT INTO user_profile(id,"userId","personalInfo","workExperience","education","skills","certificates","updatedAt")
		 VALUES($1,$2,'{}'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,now())`,
		profID, userID,
	); err != nil {
		t.Fatal(err)
	}

	// Insert 2 resumes to hit the limit.
	for i := 0; i < 2; i++ {
		rid := cuid.New()
		if _, err := pool.Exec(ctx,
			`INSERT INTO "Resume"(id,"userId",title,template,"personalInfo","workExperience",education,skills,certificates,customization,language,source,"updatedAt")
			 VALUES($1,$2,'Test','professional','{}'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'null'::jsonb,'en','agent',now())`,
			rid, userID,
		); err != nil {
			t.Fatal(err)
		}
	}

	fake := &fakeCompleter{content: selectionJSON}
	g := &gen.Gen{
		Store: &store.Store{Pool: pool},
		AI:    fake,
	}

	_, _, err := g.Resume(ctx, userID, gen.ResumeOpts{JobDescription: "Go API"})
	if err == nil {
		t.Fatal("expected error at resume limit")
	}
	se, ok := err.(*store.Error)
	if !ok {
		t.Fatalf("want *store.Error, got %T: %v", err, err)
	}
	if se.Status != 403 {
		t.Fatalf("want status 403, got %d", se.Status)
	}
	if se.Extra["limitReached"] != true {
		t.Fatalf("want limitReached=true, got %v", se.Extra)
	}
}

func TestCoverLetterGeneration(t *testing.T) {
	pool := db.ForTest(t)
	ctx := context.Background()

	userID := cuid.New()
	if _, err := pool.Exec(ctx, `INSERT INTO "user"(id,email,"updatedAt") VALUES($1,$2,now())`, userID, userID+"@t.dev"); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { pool.Exec(ctx, `DELETE FROM "user" WHERE id=$1`, userID) })

	profileData := map[string]any{
		"personalInfo":   map[string]any{"firstName": "Ann", "lastName": "Lee"},
		"workExperience": []any{},
		"education":      []any{},
		"skills":         []any{},
	}
	profID := cuid.New()
	if _, err := pool.Exec(ctx,
		`INSERT INTO user_profile(id,"userId","personalInfo","workExperience","education","skills","certificates","updatedAt")
		 VALUES($1,$2,$3::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,now())`,
		profID, userID, mustJSON(profileData["personalInfo"]),
	); err != nil {
		t.Fatal(err)
	}

	jd := "Senior Go engineer needed."
	fake := &fakeCompleter{content: coverLetterText}
	g := &gen.Gen{
		Store: &store.Store{Pool: pool},
		AI:    fake,
	}

	clID, text, err := g.CoverLetter(ctx, userID, gen.CoverLetterOpts{
		JobDescription: jd,
		Format:         "prose",
		Language:       "en",
	})
	if err != nil {
		t.Fatalf("CoverLetter() error: %v", err)
	}
	if clID == "" {
		t.Fatal("empty cover letter id")
	}
	if text != strings.TrimSpace(coverLetterText) {
		t.Fatalf("text mismatch:\nwant: %q\ngot:  %q", strings.TrimSpace(coverLetterText), text)
	}

	// Verify DB row exists with source='agent'.
	var dbSource string
	if err := pool.QueryRow(ctx, `SELECT source FROM cover_letter WHERE id=$1 AND "userId"=$2`, clID, userID).Scan(&dbSource); err != nil {
		t.Fatalf("cover_letter row not found: %v", err)
	}
	if dbSource != "agent" {
		t.Fatalf("source=%q want 'agent'", dbSource)
	}

	// Check that the AI received a user prompt matching CoverLetterUser.
	// Build expected prompt using raw profile jsonb bytes for TOON encoding.
	var rawPI, rawWE, rawEdu, rawSk []byte
	pool.QueryRow(ctx, `SELECT "personalInfo","workExperience","education","skills" FROM user_profile WHERE "userId"=$1`, userID).
		Scan(&rawPI, &rawWE, &rawEdu, &rawSk)

	// Build the profileData as TS does: {personalInfo, workExperience, education, skills}
	// and encode to TOON via order-preserving JSON decode.
	profileJSON := buildProfileJSON(rawPI, rawWE, rawEdu, rawSk)
	expectedToon, _ := prompts.EncodeTOONFromJSON(profileJSON)
	expectedUserPrompt := prompts.CoverLetterUser(jd, expectedToon)
	if fake.lastReq.UserPrompt != expectedUserPrompt {
		t.Errorf("user prompt mismatch.\nwant: %q\ngot:  %q", expectedUserPrompt, fake.lastReq.UserPrompt)
	}
}

func TestAIErrorPropagates(t *testing.T) {
	pool := db.ForTest(t)
	ctx := context.Background()

	userID := cuid.New()
	if _, err := pool.Exec(ctx, `INSERT INTO "user"(id,email,"updatedAt") VALUES($1,$2,now())`, userID, userID+"@t.dev"); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { pool.Exec(ctx, `DELETE FROM "user" WHERE id=$1`, userID) })

	profID := cuid.New()
	if _, err := pool.Exec(ctx,
		`INSERT INTO user_profile(id,"userId","personalInfo","workExperience","education","skills","certificates","updatedAt")
		 VALUES($1,$2,'{}'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,now())`,
		profID, userID,
	); err != nil {
		t.Fatal(err)
	}

	// AI returns an error.
	// The TS code catches it and returns { ok: false, status: 500, error: "Failed to generate resume" }.
	fakeErr := &fakeCompleter{err: &aiError{msg: "provider timeout"}}
	g := &gen.Gen{
		Store: &store.Store{Pool: pool},
		AI:    fakeErr,
	}

	_, _, err := g.Resume(ctx, userID, gen.ResumeOpts{JobDescription: "Go API"})
	if err == nil {
		t.Fatal("expected error from AI failure")
	}
	se, ok := err.(*store.Error)
	if !ok {
		t.Fatalf("want *store.Error, got %T: %v", err, err)
	}
	if se.Status != 500 {
		t.Fatalf("want status 500, got %d", se.Status)
	}
	if se.Message != "Failed to generate resume" {
		t.Fatalf("want 'Failed to generate resume', got %q", se.Message)
	}

	// Also test cover letter AI error.
	fakeErr2 := &fakeCompleter{err: &aiError{msg: "timeout"}}
	g2 := &gen.Gen{
		Store: &store.Store{Pool: pool},
		AI:    fakeErr2,
	}
	_, _, err2 := g2.CoverLetter(ctx, userID, gen.CoverLetterOpts{JobDescription: "test"})
	if err2 == nil {
		t.Fatal("expected error from AI failure for cover letter")
	}
	se2, ok2 := err2.(*store.Error)
	if !ok2 {
		t.Fatalf("want *store.Error, got %T: %v", err2, err2)
	}
	if se2.Status != 500 {
		t.Fatalf("want status 500, got %d", se2.Status)
	}

	// Verify cleanup: no draft rows left.
	var resumeCount int
	pool.QueryRow(ctx, `SELECT count(*) FROM "Resume" WHERE "userId"=$1`, userID).Scan(&resumeCount)
	if resumeCount != 0 {
		t.Fatalf("draft stub not cleaned up: count=%d", resumeCount)
	}
	var clCount int
	pool.QueryRow(ctx, `SELECT count(*) FROM cover_letter WHERE "userId"=$1`, userID).Scan(&clCount)
	if clCount != 0 {
		t.Fatalf("cover letter draft not cleaned up: count=%d", clCount)
	}
}

// aiError is a simple error type for tests.
type aiError struct{ msg string }

func (e *aiError) Error() string { return e.msg }

// mustJSON marshals v to a JSON string (for SQL inserts).
func mustJSON(v any) string {
	b, err := json.Marshal(v)
	if err != nil {
		return "null"
	}
	return string(b)
}

// buildProfileJSON builds a JSON object {"personalInfo":...,"workExperience":...,"education":...,"skills":...}
// from raw jsonb bytes, preserving the field key order that TS encode() sees.
func buildProfileJSON(pi, we, edu, sk []byte) []byte {
	// Assemble as TS does: { personalInfo, workExperience, education, skills }
	// Each field's value preserves its own internal key order (from DB jsonb bytes).
	buf := make([]byte, 0, len(pi)+len(we)+len(edu)+len(sk)+100)
	buf = append(buf, `{"personalInfo":`...)
	if len(pi) == 0 {
		buf = append(buf, `{}`...)
	} else {
		buf = append(buf, pi...)
	}
	buf = append(buf, `,"workExperience":`...)
	if len(we) == 0 {
		buf = append(buf, `[]`...)
	} else {
		buf = append(buf, we...)
	}
	buf = append(buf, `,"education":`...)
	if len(edu) == 0 {
		buf = append(buf, `[]`...)
	} else {
		buf = append(buf, edu...)
	}
	buf = append(buf, `,"skills":`...)
	if len(sk) == 0 {
		buf = append(buf, `[]`...)
	} else {
		buf = append(buf, sk...)
	}
	buf = append(buf, '}')
	return buf
}

// Keep time import from being unused.
var _ = time.Second
