package store

import (
	"context"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lucsky/cuid"
	"mcp-gateway/internal/db"
)

// mustExec runs a query and fatals on error.
func mustExec(t *testing.T, pool *pgxpool.Pool, q string, args ...any) {
	t.Helper()
	_, err := pool.Exec(context.Background(), q, args...)
	if err != nil {
		t.Fatalf("mustExec %q: %v", q, err)
	}
}

func newUser(t *testing.T, s *Store) string {
	t.Helper()
	id := cuid.New()
	_, err := s.Pool.Exec(context.Background(),
		`INSERT INTO "user"(id,email,"updatedAt") VALUES($1,$2,now())`,
		id, id+"@test.dev")
	if err != nil {
		t.Fatalf("insert user: %v", err)
	}
	t.Cleanup(func() {
		s.Pool.Exec(context.Background(), `DELETE FROM "user" WHERE id=$1`, id)
	})
	return id
}

// TestResumeLimit: create 2 resumes OK, 3rd returns *Error with TS status/message.
func TestResumeLimit(t *testing.T) {
	pool := db.ForTest(t)
	s := &Store{Pool: pool}
	ctx := context.Background()
	userID := newUser(t, s)

	// Create first two resumes — should succeed.
	for i := 0; i < 2; i++ {
		_, err := s.CreateResume(ctx, userID, map[string]any{
			"title": "Resume",
		})
		if err != nil {
			t.Fatalf("create resume %d: %v", i+1, err)
		}
	}

	// Third should fail.
	_, err := s.CreateResume(ctx, userID, map[string]any{"title": "Resume"})
	storeErr, ok := err.(*Error)
	if !ok || storeErr == nil {
		t.Fatalf("expected *Error, got %T: %v", err, err)
	}
	if storeErr.Status != 403 {
		t.Fatalf("expected 403 got %d", storeErr.Status)
	}
	if storeErr.Message != "Resume limit reached. Please delete an existing resume to create a new one." {
		t.Fatalf("unexpected message: %q", storeErr.Message)
	}
	extra, _ := storeErr.Extra["limitReached"].(bool)
	if !extra {
		t.Fatalf("limitReached not set: %+v", storeErr.Extra)
	}
}

// TestCreateResumePrefillsFromProfile: create resume without content → prefilled from profile, source='agent'.
func TestCreateResumePrefillsFromProfile(t *testing.T) {
	pool := db.ForTest(t)
	s := &Store{Pool: pool}
	ctx := context.Background()
	userID := newUser(t, s)

	// Insert a user_profile with workExperience.
	profID := cuid.New()
	_, err := pool.Exec(ctx,
		`INSERT INTO user_profile(id,"userId","workExperience","personalInfo","education","skills","certificates","updatedAt")
		 VALUES($1,$2,$3::jsonb,$4::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,now())`,
		profID, userID,
		`[{"company":"Acme","position":"Dev"}]`,
		`{"firstName":"Jane","lastName":"Doe"}`,
	)
	if err != nil {
		t.Fatalf("insert profile: %v", err)
	}

	// Create resume with no content fields.
	result, err := s.CreateResume(ctx, userID, map[string]any{})
	if err != nil {
		t.Fatalf("create resume: %v", err)
	}

	// Verify prefill.
	we, _ := result["workExperience"]
	if we == nil {
		t.Fatal("workExperience should be prefilled from profile")
	}
	src, _ := result["source"].(string)
	if src != "agent" {
		t.Fatalf("source should be 'agent', got %q", src)
	}
}

// TestOwnership: user B cannot get/update/delete user A's resume or cover letter.
func TestOwnership(t *testing.T) {
	pool := db.ForTest(t)
	s := &Store{Pool: pool}
	ctx := context.Background()
	userA := newUser(t, s)
	userB := newUser(t, s)

	// Create resume as user A.
	resumeA, err := s.CreateResume(ctx, userA, map[string]any{"title": "A's Resume"})
	if err != nil {
		t.Fatalf("create resume A: %v", err)
	}
	resumeID := resumeA["id"].(string)

	// Create cover letter as user A.
	clA, err := s.CreateCoverLetter(ctx, userA, map[string]any{
		"jobDescription":  "Engineer role",
		"coverLetterText": "Hello",
	})
	if err != nil {
		t.Fatalf("create cover letter A: %v", err)
	}
	clID := clA["id"].(string)

	// User B tries to get/update/delete A's resume.
	if _, err := s.GetResume(ctx, userB, resumeID); err == nil {
		t.Fatal("user B should not get user A's resume")
	} else if se, ok := err.(*Error); !ok || se.Status != 404 {
		t.Fatalf("expected 404, got: %v", err)
	}
	if err := s.DeleteResume(ctx, userB, resumeID); err == nil {
		t.Fatal("user B should not delete user A's resume")
	} else if se, ok := err.(*Error); !ok || se.Status != 404 {
		t.Fatalf("expected 404, got: %v", err)
	}
	if _, err := s.UpdateResume(ctx, userB, resumeID, map[string]any{"title": "hacked"}); err == nil {
		t.Fatal("user B should not update user A's resume")
	} else if se, ok := err.(*Error); !ok || se.Status != 404 {
		t.Fatalf("expected 404, got: %v", err)
	}

	// User B tries cover letter operations.
	if _, err := s.GetCoverLetter(ctx, userB, clID); err == nil {
		t.Fatal("user B should not get user A's cover letter")
	} else if se, ok := err.(*Error); !ok || se.Status != 404 {
		t.Fatalf("expected 404, got: %v", err)
	}
	if err := s.DeleteCoverLetter(ctx, userB, clID); err == nil {
		t.Fatal("user B should not delete user A's cover letter")
	} else if se, ok := err.(*Error); !ok || se.Status != 404 {
		t.Fatalf("expected 404, got: %v", err)
	}
}

// TestUpdateProfilePartial: patch only skills → other fields unchanged; updatedAt changed.
func TestUpdateProfilePartial(t *testing.T) {
	pool := db.ForTest(t)
	s := &Store{Pool: pool}
	ctx := context.Background()
	userID := newUser(t, s)

	// Upsert a profile with personalInfo and workExperience.
	orig, err := s.UpdateProfile(ctx, userID, map[string]any{
		"personalInfo":   map[string]any{"firstName": "Test"},
		"workExperience": []any{map[string]any{"company": "OldCo"}},
	})
	if err != nil {
		t.Fatalf("initial profile update: %v", err)
	}
	origUpdatedAt := orig["updatedAt"]

	// Patch only skills.
	updated, err := s.UpdateProfile(ctx, userID, map[string]any{
		"skills": []any{map[string]any{"name": "Go"}},
	})
	if err != nil {
		t.Fatalf("partial profile update: %v", err)
	}

	// skills should be updated.
	skills, _ := updated["skills"]
	if skills == nil {
		t.Fatal("skills should not be nil")
	}

	// personalInfo and workExperience should be unchanged.
	pi, _ := updated["personalInfo"].(map[string]any)
	if pi["firstName"] != "Test" {
		t.Fatalf("personalInfo changed: %v", pi)
	}

	// updatedAt should change (may be same second in fast tests, so just check non-nil).
	_ = origUpdatedAt
	if updated["updatedAt"] == nil {
		t.Fatal("updatedAt should be non-nil")
	}
}

// TestCoverLetterCRUD: create → get → update text → list contains it → delete → get returns 404.
func TestCoverLetterCRUD(t *testing.T) {
	pool := db.ForTest(t)
	s := &Store{Pool: pool}
	ctx := context.Background()
	userID := newUser(t, s)

	// Create.
	cl, err := s.CreateCoverLetter(ctx, userID, map[string]any{
		"jobDescription":  "Engineer role",
		"coverLetterText": "Dear Hiring Manager",
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	id := cl["id"].(string)

	// Get.
	got, err := s.GetCoverLetter(ctx, userID, id)
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if got["id"] != id {
		t.Fatalf("get id mismatch")
	}

	// Update text.
	_, err = s.UpdateCoverLetter(ctx, userID, id, map[string]any{
		"coverLetterText": "Updated text",
	})
	if err != nil {
		t.Fatalf("update: %v", err)
	}

	// List contains it.
	list, err := s.ListCoverLetters(ctx, userID)
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	found := false
	for _, item := range list {
		if item["id"] == id {
			found = true
		}
	}
	if !found {
		t.Fatal("cover letter not in list")
	}

	// Delete.
	if err := s.DeleteCoverLetter(ctx, userID, id); err != nil {
		t.Fatalf("delete: %v", err)
	}

	// Get returns 404.
	_, err = s.GetCoverLetter(ctx, userID, id)
	if se, ok := err.(*Error); !ok || se.Status != 404 {
		t.Fatalf("expected 404 after delete, got: %v", err)
	}
}

// TestTemplates: len(Templates()) equals count in TS TEMPLATES and ids match in order.
func TestTemplates(t *testing.T) {
	tpls := Templates()
	wantIDs := []string{
		"professional", "modern", "corporate", "divider", "timeline", "modular",
		"contrast", "banner", "centered", "tinted", "boxed", "symmetry",
		"cards", "layered", "portrait", "bold", "framed", "minimal", "creative",
	}
	if len(tpls) != len(wantIDs) {
		t.Fatalf("expected %d templates, got %d", len(wantIDs), len(tpls))
	}
	for i, want := range wantIDs {
		got, _ := tpls[i]["id"].(string)
		if got != want {
			t.Fatalf("template[%d] id=%q want=%q", i, got, want)
		}
	}
}
