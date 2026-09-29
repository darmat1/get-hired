// PARITY: src/app/api/agent/v1/resumes/route.ts, src/app/api/agent/v1/resumes/[id]/route.ts — keep in sync, see mcp-gateway/PARITY.md
package store

import (
	"context"
	"fmt"
	"time"

	"github.com/lucsky/cuid"
)

// updatableResumeFields mirrors UPDATABLE_FIELDS in the TS route.
var updatableResumeFields = []string{
	"title", "template", "personalInfo", "workExperience", "education",
	"skills", "certificates", "customization", "language", "targetPosition", "targetCompany",
}

// scanResume reads a full resume row (all columns) into a map.
// Column order must match the SELECT below.
func scanResumeRow(row interface {
	Scan(...any) error
}) (map[string]any, error) {
	var id, title, template, source, language string
	var targetPosition, targetCompany *string
	var personalInfo, workExperience, education, skills, certificates, customization any
	var createdAt, updatedAt time.Time

	err := row.Scan(
		&id, &title, &template, &personalInfo, &workExperience, &education,
		&skills, &certificates, &customization, &source, &language,
		&targetPosition, &targetCompany, &createdAt, &updatedAt,
	)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"id":             id,
		"title":          title,
		"template":       template,
		"personalInfo":   personalInfo,
		"workExperience": workExperience,
		"education":      education,
		"skills":         skills,
		"certificates":   certificates,
		"customization":  customization,
		"source":         source,
		"language":       language,
		"targetPosition": targetPosition,
		"targetCompany":  targetCompany,
		"createdAt":      formatTime(createdAt),
		"updatedAt":      formatTime(updatedAt),
	}, nil
}

const resumeAllCols = `id,title,template,"personalInfo","workExperience",education,skills,certificates,customization,source,language,"targetPosition","targetCompany","createdAt","updatedAt"`

// ListResumes returns lean resume summaries for a user ordered by updatedAt desc.
// Matches: GET /api/agent/v1/resumes (select shape)
func (s *Store) ListResumes(ctx context.Context, userID string) ([]map[string]any, error) {
	rows, err := s.Pool.Query(ctx,
		`SELECT id,title,template,"targetPosition","targetCompany","createdAt","updatedAt"
		 FROM "Resume" WHERE "userId"=$1 ORDER BY "updatedAt" DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []map[string]any
	for rows.Next() {
		var id, title, template string
		var targetPosition, targetCompany *string
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &title, &template, &targetPosition, &targetCompany, &createdAt, &updatedAt); err != nil {
			return nil, err
		}
		result = append(result, map[string]any{
			"id":             id,
			"title":          title,
			"template":       template,
			"targetPosition": targetPosition,
			"targetCompany":  targetCompany,
			"createdAt":      formatTime(createdAt),
			"updatedAt":      formatTime(updatedAt),
		})
	}
	if result == nil {
		result = []map[string]any{}
	}
	return result, rows.Err()
}

// GetResume returns a full resume by id, scoped to userID. Returns *Error{Status:404} if not found.
// Matches: GET /api/agent/v1/resumes/{id}
func (s *Store) GetResume(ctx context.Context, userID, id string) (map[string]any, error) {
	row := s.Pool.QueryRow(ctx,
		`SELECT `+resumeAllCols+` FROM "Resume" WHERE id=$1 AND "userId"=$2`,
		id, userID,
	)
	m, err := scanResumeRow(row)
	if err != nil {
		if isNoRows(err) {
			return nil, &Error{Status: 404, Message: "Resume not found"}
		}
		return nil, err
	}
	return m, nil
}

// CreateResume creates a new resume (max 2). Prefills from profile if no content fields supplied.
// source is always set to "agent". Returns *Error{Status:403, limitReached:true} at limit.
// Matches: POST /api/agent/v1/resumes
func (s *Store) CreateResume(ctx context.Context, userID string, in map[string]any) (map[string]any, error) {
	// Count existing resumes.
	var count int
	if err := s.Pool.QueryRow(ctx,
		`SELECT count(*) FROM "Resume" WHERE "userId"=$1`, userID,
	).Scan(&count); err != nil {
		return nil, err
	}
	if count >= 2 {
		return nil, &Error{
			Status:  403,
			Message: "Resume limit reached. Please delete an existing resume to create a new one.",
			Extra:   map[string]any{"limitReached": true},
		}
	}

	// Profile prefill: only if none of the content keys are provided.
	personalInfo := in["personalInfo"]
	workExperience := in["workExperience"]
	education := in["education"]
	skills := in["skills"]
	certificates := in["certificates"]

	needsPrefill := personalInfo == nil && workExperience == nil && education == nil && skills == nil && certificates == nil
	if needsPrefill {
		var pi, we, edu, sk, cert any
		err := s.Pool.QueryRow(ctx,
			`SELECT "personalInfo","workExperience","education","skills","certificates"
			 FROM user_profile WHERE "userId"=$1`,
			userID,
		).Scan(&pi, &we, &edu, &sk, &cert)
		if err == nil {
			personalInfo = coerceJSON(pi, map[string]any{})
			workExperience = coerceJSON(we, []any{})
			education = coerceJSON(edu, []any{})
			skills = coerceJSON(sk, []any{})
			certificates = coerceJSON(cert, []any{})
		}
		// If no profile, leave nil → defaults applied below.
	}

	if personalInfo == nil {
		personalInfo = map[string]any{}
	}

	// Build title.
	title := ""
	if t, ok := in["title"].(string); ok && t != "" {
		title = t
	} else {
		if pi, ok := personalInfo.(map[string]any); ok {
			fn, _ := pi["firstName"].(string)
			ln, _ := pi["lastName"].(string)
			if fn != "" && ln != "" {
				title = "Resume " + fn + " " + ln
			}
		}
		if title == "" {
			title = "New Resume"
		}
	}

	template := "professional"
	if t, ok := in["template"].(string); ok && t != "" {
		template = t
	}
	language := "en"
	if l, ok := in["language"].(string); ok && l != "" {
		language = l
	}

	id := cuid.New()
	now := time.Now()

	var createdAt, updatedAt time.Time
	err := s.Pool.QueryRow(ctx,
		`INSERT INTO "Resume"(id,"userId",title,template,"personalInfo","workExperience",education,skills,certificates,customization,language,"targetPosition","targetCompany",source,"updatedAt")
		 VALUES($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,$8::jsonb,$9::jsonb,$10::jsonb,$11,$12,$13,'agent',$14)
		 RETURNING "createdAt","updatedAt"`,
		id, userID, title, template,
		marshalJSON(personalInfo),
		marshalJSON(coerceJSON(workExperience, []any{})),
		marshalJSON(coerceJSON(education, []any{})),
		marshalJSON(coerceJSON(skills, []any{})),
		marshalJSON(coerceJSON(certificates, []any{})),
		marshalJSON(in["customization"]),
		language,
		nullableString(in["targetPosition"]),
		nullableString(in["targetCompany"]),
		now,
	).Scan(&createdAt, &updatedAt)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"id":             id,
		"title":          title,
		"template":       template,
		"personalInfo":   personalInfo,
		"workExperience": coerceJSON(workExperience, []any{}),
		"education":      coerceJSON(education, []any{}),
		"skills":         coerceJSON(skills, []any{}),
		"certificates":   coerceJSON(certificates, []any{}),
		"customization":  in["customization"],
		"source":         "agent",
		"language":       language,
		"targetPosition": nullableString(in["targetPosition"]),
		"targetCompany":  nullableString(in["targetCompany"]),
		"createdAt":      formatTime(createdAt),
		"updatedAt":      formatTime(updatedAt),
	}, nil
}

// UpdateResume applies a partial patch to a resume. Only fields in updatableResumeFields are updated.
// Returns *Error{Status:404} if not found or not owned.
// Matches: PATCH /api/agent/v1/resumes/{id}
func (s *Store) UpdateResume(ctx context.Context, userID, id string, patch map[string]any) (map[string]any, error) {
	// Ownership check.
	var exists bool
	if err := s.Pool.QueryRow(ctx,
		`SELECT true FROM "Resume" WHERE id=$1 AND "userId"=$2`, id, userID,
	).Scan(&exists); err != nil {
		if isNoRows(err) {
			return nil, &Error{Status: 404, Message: "Resume not found"}
		}
		return nil, err
	}

	// Build SET clause from allow-list.
	setClauses := []string{`"updatedAt"=now()`}
	args := []any{}
	argIdx := 1

	jsonbFields := map[string]bool{
		"personalInfo": true, "workExperience": true, "education": true,
		"skills": true, "certificates": true, "customization": true,
	}

	for _, field := range updatableResumeFields {
		v, ok := patch[field]
		if !ok {
			continue
		}
		if jsonbFields[field] {
			setClauses = append(setClauses, `"`+field+`"=$`+itoa(argIdx)+`::jsonb`)
			args = append(args, marshalJSON(v))
		} else {
			setClauses = append(setClauses, `"`+field+`"=$`+itoa(argIdx))
			args = append(args, v)
		}
		argIdx++
	}

	if len(setClauses) == 1 {
		// Only updatedAt — just re-fetch.
		return s.GetResume(ctx, userID, id)
	}

	args = append(args, id)
	setSQL := joinCommas(setClauses)

	row := s.Pool.QueryRow(ctx,
		`UPDATE "Resume" SET `+setSQL+` WHERE id=$`+itoa(argIdx)+` RETURNING `+resumeAllCols,
		args...,
	)
	return scanResumeRow(row)
}

// DeleteResume deletes a resume by id, scoped to userID.
// Returns *Error{Status:404} if not found or not owned.
// Matches: DELETE /api/agent/v1/resumes/{id}
func (s *Store) DeleteResume(ctx context.Context, userID, id string) error {
	var existingID string
	if err := s.Pool.QueryRow(ctx,
		`SELECT id FROM "Resume" WHERE id=$1 AND "userId"=$2`, id, userID,
	).Scan(&existingID); err != nil {
		if isNoRows(err) {
			return &Error{Status: 404, Message: "Resume not found"}
		}
		return err
	}

	_, err := s.Pool.Exec(ctx, `DELETE FROM "Resume" WHERE id=$1`, id)
	return err
}

// nullableString returns a *string for optional string fields (nil if v is nil or not string).
func nullableString(v any) *string {
	if v == nil {
		return nil
	}
	s, ok := v.(string)
	if !ok || s == "" {
		return nil
	}
	return &s
}

// itoa converts an int to its string representation (for SQL placeholder building).
func itoa(n int) string {
	if n < 10 {
		return string(rune('0' + n))
	}
	// Sufficient for our use (up to ~15 fields).
	return fmt.Sprintf("%d", n)
}

// joinCommas joins strings with ", ".
func joinCommas(parts []string) string {
	result := ""
	for i, p := range parts {
		if i > 0 {
			result += ", "
		}
		result += p
	}
	return result
}
