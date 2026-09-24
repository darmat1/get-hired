// PARITY: src/app/api/agent/v1/profile/route.ts — keep in sync, see mcp-gateway/PARITY.md
package store

import (
	"context"
	"time"

	"github.com/lucsky/cuid"
)

const tsLayout = "2006-01-02T15:04:05.000Z"

// formatTime formats a time.Time as ISO-8601 UTC with milliseconds, matching JSON.stringify(Date).
func formatTime(t time.Time) string {
	return t.UTC().Format(tsLayout)
}

// emptyProfile returns the empty profile shape the TS route returns when no profile exists.
func emptyProfile() map[string]any {
	return map[string]any{
		"personalInfo":   map[string]any{},
		"workExperience": []any{},
		"education":      []any{},
		"skills":         []any{},
		"certificates":   []any{},
	}
}

// coerceJSON returns v if non-nil, else def.
func coerceJSON(v any, def any) any {
	if v == nil {
		return def
	}
	return v
}

// GetProfile returns the user's profile. If none exists, returns the EMPTY_PROFILE shape.
// Matches: GET /api/agent/v1/profile
func (s *Store) GetProfile(ctx context.Context, userID string) (map[string]any, error) {
	var personalInfo, workExperience, education, skills, certificates any

	err := s.Pool.QueryRow(ctx,
		`SELECT "personalInfo","workExperience","education","skills","certificates"
		 FROM user_profile WHERE "userId"=$1`,
		userID,
	).Scan(&personalInfo, &workExperience, &education, &skills, &certificates)
	if err != nil {
		// pgx returns pgx.ErrNoRows — treat as no profile (return empty).
		// Import pgx inline to avoid a package-level import of pgx only for this.
		if isNoRows(err) {
			return emptyProfile(), nil
		}
		return nil, err
	}

	return map[string]any{
		"personalInfo":   coerceJSON(personalInfo, map[string]any{}),
		"workExperience": coerceJSON(workExperience, []any{}),
		"education":      coerceJSON(education, []any{}),
		"skills":         coerceJSON(skills, []any{}),
		"certificates":   coerceJSON(certificates, []any{}),
	}, nil
}

// UpdateProfile upserts the user's profile with partial-patch semantics.
// Only keys present in patch override existing values; missing keys keep the existing data.
// Matches: PATCH /api/agent/v1/profile
func (s *Store) UpdateProfile(ctx context.Context, userID string, patch map[string]any) (map[string]any, error) {
	// Load existing.
	var existingPersonalInfo, existingWorkExperience, existingEducation, existingSkills, existingCertificates any
	_ = s.Pool.QueryRow(ctx,
		`SELECT "personalInfo","workExperience","education","skills","certificates"
		 FROM user_profile WHERE "userId"=$1`,
		userID,
	).Scan(&existingPersonalInfo, &existingWorkExperience, &existingEducation, &existingSkills, &existingCertificates)
	// Ignore errors — if no row, existing* are nil and we use defaults.

	pick := func(key string, existing any, def any) any {
		if v, ok := patch[key]; ok {
			return v
		}
		return coerceJSON(existing, def)
	}

	pi := pick("personalInfo", existingPersonalInfo, map[string]any{})
	we := pick("workExperience", existingWorkExperience, []any{})
	edu := pick("education", existingEducation, []any{})
	sk := pick("skills", existingSkills, []any{})
	cert := pick("certificates", existingCertificates, []any{})

	var id string
	var createdAt, updatedAt time.Time
	err := s.Pool.QueryRow(ctx,
		`INSERT INTO user_profile(id,"userId","personalInfo","workExperience","education","skills","certificates","updatedAt")
		 VALUES($7,$1,$2::jsonb,$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb,now())
		 ON CONFLICT("userId") DO UPDATE SET
		   "personalInfo"=EXCLUDED."personalInfo",
		   "workExperience"=EXCLUDED."workExperience",
		   "education"=EXCLUDED."education",
		   "skills"=EXCLUDED."skills",
		   "certificates"=EXCLUDED."certificates",
		   "updatedAt"=now()
		 RETURNING id,"createdAt","updatedAt"`,
		userID, marshalJSON(pi), marshalJSON(we), marshalJSON(edu), marshalJSON(sk), marshalJSON(cert), cuid.New(), // id used only on insert, like Prisma upsert
	).Scan(&id, &createdAt, &updatedAt)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"personalInfo":   pi,
		"workExperience": we,
		"education":      edu,
		"skills":         sk,
		"certificates":   cert,
		"updatedAt":      formatTime(updatedAt),
		"createdAt":      formatTime(createdAt),
	}, nil
}
