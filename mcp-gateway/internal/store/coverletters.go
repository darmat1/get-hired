// PARITY: src/app/api/agent/v1/cover-letters/route.ts, src/app/api/agent/v1/cover-letters/[id]/route.ts — keep in sync, see mcp-gateway/PARITY.md
package store

import (
	"context"
	"time"

	"github.com/lucsky/cuid"
)

// scanCoverLetterRow reads a full cover_letter row into a map.
func scanCoverLetterRow(row interface {
	Scan(...any) error
}) (map[string]any, error) {
	var id, jobDescription, coverLetterText, format, language, source, userID string
	var resumeID *string
	var createdAt, updatedAt time.Time

	err := row.Scan(
		&id, &userID, &jobDescription, &coverLetterText, &format, &language,
		&source, &resumeID, &createdAt, &updatedAt,
	)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"id":              id,
		"userId":          userID,
		"jobDescription":  jobDescription,
		"coverLetterText": coverLetterText,
		"format":          format,
		"language":        language,
		"source":          source,
		"resumeId":        resumeID,
		"createdAt":       formatTime(createdAt),
		"updatedAt":       formatTime(updatedAt),
	}, nil
}

const clAllCols = `id,"userId","jobDescription","coverLetterText",format,language,source,"resumeId","createdAt","updatedAt"`

// ListCoverLetters returns cover letters for a user, ordered by createdAt desc.
// jobDescription is truncated to 200 chars in the list shape (matches TS route).
// Matches: GET /api/agent/v1/cover-letters
func (s *Store) ListCoverLetters(ctx context.Context, userID string) ([]map[string]any, error) {
	rows, err := s.Pool.Query(ctx,
		`SELECT id,"jobDescription",format,language,"resumeId","createdAt","updatedAt"
		 FROM cover_letter WHERE "userId"=$1 ORDER BY "createdAt" DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []map[string]any
	for rows.Next() {
		var id, jobDescription, format, language string
		var resumeID *string
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &jobDescription, &format, &language, &resumeID, &createdAt, &updatedAt); err != nil {
			return nil, err
		}
		// Truncate jobDescription to 200 chars like the TS route.
		jd := jobDescription
		if len(jd) > 200 {
			jd = jd[:200]
		}
		result = append(result, map[string]any{
			"id":             id,
			"jobDescription": jd,
			"format":         format,
			"language":       language,
			"resumeId":       resumeID,
			"createdAt":      formatTime(createdAt),
			"updatedAt":      formatTime(updatedAt),
		})
	}
	if result == nil {
		result = []map[string]any{}
	}
	return result, rows.Err()
}

// GetCoverLetter returns a full cover letter by id, scoped to userID.
// Returns *Error{Status:404} if not found.
// Matches: GET /api/agent/v1/cover-letters/{id}
func (s *Store) GetCoverLetter(ctx context.Context, userID, id string) (map[string]any, error) {
	row := s.Pool.QueryRow(ctx,
		`SELECT `+clAllCols+` FROM cover_letter WHERE id=$1 AND "userId"=$2`,
		id, userID,
	)
	m, err := scanCoverLetterRow(row)
	if err != nil {
		if isNoRows(err) {
			return nil, &Error{Status: 404, Message: "Cover letter not found"}
		}
		return nil, err
	}
	return m, nil
}

// CreateCoverLetter saves a cover letter.
// Validates required fields. If resumeId provided, checks ownership.
// Evicts oldest if at cap (2). source='agent'.
// Matches: POST /api/agent/v1/cover-letters
func (s *Store) CreateCoverLetter(ctx context.Context, userID string, in map[string]any) (map[string]any, error) {
	jd, _ := in["jobDescription"].(string)
	text, _ := in["coverLetterText"].(string)

	if jd == "" || text == "" {
		return nil, &Error{Status: 400, Message: "jobDescription and coverLetterText are required"}
	}

	// Validate resumeId ownership.
	resumeID, _ := in["resumeId"].(string)
	if resumeID != "" {
		var exists bool
		err := s.Pool.QueryRow(ctx,
			`SELECT true FROM "Resume" WHERE id=$1 AND "userId"=$2`, resumeID, userID,
		).Scan(&exists)
		if err != nil {
			if isNoRows(err) {
				return nil, &Error{Status: 404, Message: "Resume not found"}
			}
			return nil, err
		}
	}

	// Enforce 2-record cap: evict oldest.
	var existingCount int
	if err := s.Pool.QueryRow(ctx,
		`SELECT count(*) FROM cover_letter WHERE "userId"=$1`, userID,
	).Scan(&existingCount); err != nil {
		return nil, err
	}
	if existingCount >= 2 {
		var oldestID string
		err := s.Pool.QueryRow(ctx,
			`SELECT id FROM cover_letter WHERE "userId"=$1 ORDER BY "createdAt" ASC LIMIT 1`, userID,
		).Scan(&oldestID)
		if err == nil {
			_, _ = s.Pool.Exec(ctx, `DELETE FROM cover_letter WHERE id=$1`, oldestID)
		}
	}

	format := "bullet"
	if f, ok := in["format"].(string); ok && f != "" {
		format = f
	}
	language := "en"
	if l, ok := in["language"].(string); ok && l != "" {
		language = l
	}

	id := cuid.New()
	now := time.Now()

	var crAt, upAt time.Time
	var dbResumeID *string
	if resumeID != "" {
		dbResumeID = &resumeID
	}
	err := s.Pool.QueryRow(ctx,
		`INSERT INTO cover_letter(id,"userId","jobDescription","coverLetterText",format,language,"resumeId",source,"updatedAt")
		 VALUES($1,$2,$3,$4,$5,$6,$7,'agent',$8)
		 RETURNING "createdAt","updatedAt"`,
		id, userID, jd, text, format, language, dbResumeID, now,
	).Scan(&crAt, &upAt)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"id":              id,
		"userId":          userID,
		"jobDescription":  jd,
		"coverLetterText": text,
		"format":          format,
		"language":        language,
		"source":          "agent",
		"resumeId":        dbResumeID,
		"createdAt":       formatTime(crAt),
		"updatedAt":       formatTime(upAt),
	}, nil
}

// UpdateCoverLetter applies a partial patch (coverLetterText, format, language) to a cover letter.
// Returns *Error{Status:404} if not found or not owned.
// Matches: PATCH /api/agent/v1/cover-letters/{id}
func (s *Store) UpdateCoverLetter(ctx context.Context, userID, id string, patch map[string]any) (map[string]any, error) {
	// Ownership check.
	var existingID string
	if err := s.Pool.QueryRow(ctx,
		`SELECT id FROM cover_letter WHERE id=$1 AND "userId"=$2`, id, userID,
	).Scan(&existingID); err != nil {
		if isNoRows(err) {
			return nil, &Error{Status: 404, Message: "Cover letter not found"}
		}
		return nil, err
	}

	// Build SET clause. Only coverLetterText, format, language are updatable.
	setClauses := []string{`"updatedAt"=now()`}
	args := []any{}
	argIdx := 1

	for _, field := range []string{"coverLetterText", "format", "language"} {
		if v, ok := patch[field]; ok {
			setClauses = append(setClauses, `"`+field+`"=$`+itoa(argIdx))
			args = append(args, v)
			argIdx++
		}
	}
	args = append(args, id)

	setSQL := joinCommas(setClauses)
	row := s.Pool.QueryRow(ctx,
		`UPDATE cover_letter SET `+setSQL+` WHERE id=$`+itoa(argIdx)+` RETURNING `+clAllCols,
		args...,
	)
	return scanCoverLetterRow(row)
}

// DeleteCoverLetter deletes a cover letter by id, scoped to userID.
// Returns *Error{Status:404} if not found or not owned.
// Matches: DELETE /api/agent/v1/cover-letters/{id}
func (s *Store) DeleteCoverLetter(ctx context.Context, userID, id string) error {
	var existingID string
	if err := s.Pool.QueryRow(ctx,
		`SELECT id FROM cover_letter WHERE id=$1 AND "userId"=$2`, id, userID,
	).Scan(&existingID); err != nil {
		if isNoRows(err) {
			return &Error{Status: 404, Message: "Cover letter not found"}
		}
		return err
	}
	_, err := s.Pool.Exec(ctx, `DELETE FROM cover_letter WHERE id=$1`, id)
	return err
}
