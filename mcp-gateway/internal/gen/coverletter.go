// PARITY: src/lib/agent/cover-letter-generation.ts — keep in sync, see mcp-gateway/PARITY.md
package gen

import (
	"context"
	"strings"
	"time"

	"github.com/lucsky/cuid"
	"mcp-gateway/internal/ai"
	"mcp-gateway/internal/prompts"
	"mcp-gateway/internal/store"
)

// CoverLetter generates a cover letter and returns its ID and text.
func (g *Gen) CoverLetter(ctx context.Context, userID string, o CoverLetterOpts) (string, string, error) {
	jobDescription := strings.TrimSpace(o.JobDescription)
	if jobDescription == "" {
		return "", "", &store.Error{Status: 400, Message: "jobDescription is required"}
	}

	format := o.Format
	if format != "prose" {
		format = "bullet"
	}
	language := o.Language
	if language == "" {
		language = "en"
	}

	// 1. Transaction to reserve slot and rate limit
	tx, err := g.Store.Pool.Begin(ctx)
	if err != nil {
		return "", "", err
	}
	defer tx.Rollback(ctx)

	var lastCreatedAt *time.Time
	_ = tx.QueryRow(ctx,
		`SELECT "createdAt" FROM cover_letter WHERE "userId"=$1 ORDER BY "createdAt" DESC LIMIT 1`, userID,
	).Scan(&lastCreatedAt)

	if lastCreatedAt != nil && time.Since(*lastCreatedAt) < 60*time.Second {
		return "", "", &store.Error{Status: 429, Message: "Rate limit exceeded. Please wait a minute."}
	}

	var count int
	_ = tx.QueryRow(ctx, `SELECT count(*) FROM cover_letter WHERE "userId"=$1`, userID).Scan(&count)
	if count >= 2 {
		var oldestID string
		if err := tx.QueryRow(ctx,
			`SELECT id FROM cover_letter WHERE "userId"=$1 ORDER BY "createdAt" ASC LIMIT 1`, userID,
		).Scan(&oldestID); err == nil {
			_, _ = tx.Exec(ctx, `DELETE FROM cover_letter WHERE id=$1`, oldestID)
		}
	}

	stubID := cuid.New()
	var resumeID *string
	if o.ResumeID != "" {
		resumeID = &o.ResumeID
	}
	now := time.Now()

	_, err = tx.Exec(ctx,
		`INSERT INTO cover_letter(id,"userId","jobDescription","coverLetterText",format,language,"resumeId",source,"createdAt","updatedAt")
		 VALUES($1,$2,$3,'Generating...',$4,$5,$6,'agent',$7,$7)`,
		stubID, userID, jobDescription, format, language, resumeID, now,
	)
	if err != nil {
		return "", "", err
	}

	if err := tx.Commit(ctx); err != nil {
		return "", "", err
	}

	// 2. Fetch profile or resume (raw jsonb bytes for order-preserving TOON encoding)
	var rawPI, rawWE, rawEdu, rawSk []byte
	var fetchErr error

	if o.ResumeID != "" {
		fetchErr = g.Store.Pool.QueryRow(ctx,
			`SELECT "personalInfo","workExperience",education,skills FROM "Resume" WHERE id=$1 AND "userId"=$2`,
			o.ResumeID, userID,
		).Scan(&rawPI, &rawWE, &rawEdu, &rawSk)
		if fetchErr != nil {
			_, _ = g.Store.Pool.Exec(context.Background(), `DELETE FROM cover_letter WHERE id=$1`, stubID)
			return "", "", &store.Error{Status: 400, Message: "Resume not found"}
		}
	} else {
		fetchErr = g.Store.Pool.QueryRow(ctx,
			`SELECT "personalInfo","workExperience",education,skills FROM user_profile WHERE "userId"=$1`,
			userID,
		).Scan(&rawPI, &rawWE, &rawEdu, &rawSk)
		if fetchErr != nil {
			_, _ = g.Store.Pool.Exec(context.Background(), `DELETE FROM cover_letter WHERE id=$1`, stubID)
			return "", "", &store.Error{Status: 400, Message: "Profile not found. Please fill in your experience first."}
		}
	}

	// Build profileJSON preserving order for TOON
	profileJSON := buildProfileJSONBytes(rawPI, rawWE, rawEdu, rawSk)
	profileToon, err := prompts.EncodeTOONFromJSON(profileJSON)
	if err != nil {
		_, _ = g.Store.Pool.Exec(context.Background(), `DELETE FROM cover_letter WHERE id=$1`, stubID)
		return "", "", &store.Error{Status: 500, Message: "Failed to generate cover letter"}
	}

	systemPrompt := prompts.CoverLetterSystem(format)
	userPrompt := prompts.CoverLetterUser(jobDescription, profileToon)

	aiResp, aiErr := g.AI.Complete(ctx, ai.Request{
		SystemPrompt: systemPrompt,
		UserPrompt:   userPrompt,
		Temperature:  &temp030,
		MaxTokens:    &maxTok700,
	}, userID)

	if aiErr != nil {
		_, _ = g.Store.Pool.Exec(context.Background(), `DELETE FROM cover_letter WHERE id=$1`, stubID)
		msg := aiErr.Error()
		if msg == "" {
			msg = "Failed to generate cover letter"
		}
		status := 500
		if strings.Contains(msg, "not found") {
			status = 400
		}
		return "", "", &store.Error{Status: status, Message: msg}
	}

	coverLetterText := strings.TrimSpace(aiResp.Content)

	_, updateErr := g.Store.Pool.Exec(ctx,
		`UPDATE cover_letter SET "coverLetterText"=$1, "updatedAt"=now() WHERE id=$2`,
		coverLetterText, stubID,
	)
	if updateErr != nil {
		_, _ = g.Store.Pool.Exec(context.Background(), `DELETE FROM cover_letter WHERE id=$1`, stubID)
		return "", "", &store.Error{Status: 500, Message: "Failed to generate cover letter"}
	}

	return stubID, coverLetterText, nil
}

// buildProfileJSONBytes builds a JSON object from raw jsonb bytes, preserving the field key order.
func buildProfileJSONBytes(pi, we, edu, sk []byte) []byte {
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
