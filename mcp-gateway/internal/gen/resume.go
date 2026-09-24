// PARITY: src/lib/agent/resume-generation.ts — keep in sync, see mcp-gateway/PARITY.md
package gen

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/lucsky/cuid"

	"mcp-gateway/internal/ai"
	"mcp-gateway/internal/prompts"
	"mcp-gateway/internal/store"
)

// Completer is satisfied by *ai.Client (and test fakes).
type Completer interface {
	Complete(ctx context.Context, req ai.Request, userID string) (ai.Response, error)
}

// Gen wires together store and AI for generation operations.
type Gen struct {
	Store *store.Store
	AI    Completer
}

// ResumeOpts holds caller-supplied parameters for resume generation.
type ResumeOpts struct {
	TargetRole     string
	JobDescription string
	Template       string
}

// CoverLetterOpts holds caller-supplied parameters for cover letter generation.
type CoverLetterOpts struct {
	JobDescription string
	Format         string
	Language       string
	ResumeID       string
}

// selectionSystemPrompt mirrors the TS literal passed to executeStructuredAI.
const selectionSystemPrompt = "You are a resume strategist. Return ONLY valid JSON, no markdown, no explanations."

// temp030 is 0.3 — pointer for ai.Request.Temperature.
var temp030 = float64(0.3)

// maxTok600 is 600 — pointer for ai.Request.MaxTokens.
var maxTok600 = 600

// maxTok700 is 700 — pointer for ai.Request.MaxTokens.
var maxTok700 = 700

// jsonObjectFormat matches responseFormat: { type: "json_object" } used by executeStructuredAI.
var jsonObjectFormat = &ai.ResponseFormat{Type: "json_object"}

// Resume generates a resume for userID using AI selection.
// It mirrors generateResumeForUser from src/lib/agent/resume-generation.ts (source="agent").
//
// Steps (identical to TS):
//  1. Validate: targetRole or jobDescription required.
//  2. Count existing resumes; return *store.Error{403,limitReached} if >=2.
//  3. Check rate limit: last resume created <60s ago → *store.Error{429}.
//  4. Fetch profile; return *store.Error{400} if missing.
//  5. INSERT draft stub (title="Generating...", source="agent").
//  6. Call AI to select experience/skills.
//  7. Parse selection JSON, filter exp/skills.
//  8. UPDATE stub with real data.
//  9. On AI error: DELETE stub, return *store.Error{500}.
func (g *Gen) Resume(ctx context.Context, userID string, o ResumeOpts) (resumeID, title string, err error) {
	targetRole := o.TargetRole
	jobDescription := o.JobDescription
	template := o.Template
	if template == "" {
		template = "professional"
	}

	if strings.TrimSpace(targetRole) == "" && strings.TrimSpace(jobDescription) == "" {
		return "", "", &store.Error{Status: 400, Message: "targetRole or jobDescription is required"}
	}

	// 1. Count resumes (mirrors Prisma tx check).
	var resumeCount int
	if err := g.Store.Pool.QueryRow(ctx,
		`SELECT count(*) FROM "Resume" WHERE "userId"=$1`, userID,
	).Scan(&resumeCount); err != nil {
		return "", "", err
	}
	if resumeCount >= 2 {
		return "", "", &store.Error{
			Status:  403,
			Message: "Resume limit reached. Please delete an existing resume first.",
			Extra:   map[string]any{"limitReached": true},
		}
	}

	// 2. Rate limit: 1 per minute (mirrors TS `lastResume && Date.now() - lastResume.createdAt < 60000`).
	var lastCreatedAt *time.Time
	_ = g.Store.Pool.QueryRow(ctx,
		`SELECT "createdAt" FROM "Resume" WHERE "userId"=$1 ORDER BY "createdAt" DESC LIMIT 1`, userID,
	).Scan(&lastCreatedAt)
	if lastCreatedAt != nil && time.Since(*lastCreatedAt) < 60*time.Second {
		return "", "", &store.Error{Status: 429, Message: "Rate limit exceeded. Please wait a minute."}
	}

	// 3. Fetch profile (raw jsonb bytes for order-preserving TOON encoding).
	var rawPI, rawWE, rawEdu, rawSk, rawCert, rawCerts []byte
	err2 := g.Store.Pool.QueryRow(ctx,
		`SELECT "personalInfo","workExperience","education","skills","certificates" FROM user_profile WHERE "userId"=$1`,
		userID,
	).Scan(&rawPI, &rawWE, &rawEdu, &rawSk, &rawCerts)
	if err2 != nil {
		// No profile found.
		return "", "", &store.Error{Status: 400, Message: "Profile not found. Please fill in your experience first."}
	}
	rawCert = rawCerts

	// 4. Create draft stub to reserve the quota slot.
	stubID := cuid.New()
	now := time.Now()
	if _, execErr := g.Store.Pool.Exec(ctx,
		`INSERT INTO "Resume"(id,"userId",title,template,"personalInfo","workExperience",education,skills,certificates,customization,language,source,"updatedAt")
		 VALUES($1,$2,'Generating...',$3,'{}'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'null'::jsonb,'en','agent',$4)`,
		stubID, userID, template, now,
	); execErr != nil {
		return "", "", execErr
	}

	// 5. Build the selection prompt, mirroring TS buildSelectionPrompt.
	// "Key order trap": The profile data comes from jsonb — decode with order-preserving
	// decoder so TOON/JSON matches TS output.
	profileForSelection := buildProfileMap(rawPI, rawWE, rawEdu, rawSk)

	var selectionPrompt string
	if jobDescription != "" {
		selectionPrompt = prompts.Selection(profileForSelection, targetRole, jobDescription)
	} else {
		selectionPrompt = prompts.Selection(profileForSelection, targetRole, "")
	}

	aiResp, aiErr := g.AI.Complete(ctx, ai.Request{
		SystemPrompt:   selectionSystemPrompt,
		UserPrompt:     selectionPrompt,
		Temperature:    &temp030,
		MaxTokens:      &maxTok600,
		ResponseFormat: jsonObjectFormat,
	}, userID)
	if aiErr != nil {
		// Clean up draft stub.
		_, _ = g.Store.Pool.Exec(context.Background(), `DELETE FROM "Resume" WHERE id=$1`, stubID)
		return "", "", &store.Error{Status: 500, Message: "Failed to generate resume"}
	}

	// 6. Parse AI selection result.
	parsed, parseErr := ai.ParseJSONResponse(aiResp.Content)
	if parseErr != nil {
		_, _ = g.Store.Pool.Exec(context.Background(), `DELETE FROM "Resume" WHERE id=$1`, stubID)
		return "", "", &store.Error{Status: 500, Message: "Failed to generate resume"}
	}
	sel, _ := parsed.(map[string]any)

	selTitle, _ := sel["title"].(string)

	// selectedExpIds
	var selectedExpIDs []string
	if raw, ok := sel["selectedExpIds"].([]any); ok {
		for _, v := range raw {
			if s, ok := v.(string); ok {
				selectedExpIDs = append(selectedExpIDs, s)
			}
		}
	}

	// selectedSkillNames
	var selectedSkillNames []string
	if raw, ok := sel["selectedSkillNames"].([]any); ok {
		for _, v := range raw {
			if s, ok := v.(string); ok {
				selectedSkillNames = append(selectedSkillNames, s)
			}
		}
	}

	// 7. Decode workExperience from raw jsonb bytes.
	var workExperience []map[string]any
	if len(rawWE) > 0 {
		_ = json.Unmarshal(rawWE, &workExperience)
	}

	// Filter experience: keep only selected ids, fall back to all if none match.
	expIDSet := make(map[string]bool, len(selectedExpIDs))
	for _, id := range selectedExpIDs {
		expIDSet[id] = true
	}
	var filteredExp []map[string]any
	for _, e := range workExperience {
		if id, _ := e["id"].(string); expIDSet[id] {
			filteredExp = append(filteredExp, e)
		}
	}
	finalExp := filteredExp
	if len(finalExp) == 0 {
		finalExp = workExperience
	}

	// Decode skills from raw jsonb bytes.
	type skillRow struct {
		ID       string `json:"id"`
		Name     string `json:"name"`
		Category string `json:"category"`
		Level    string `json:"level"`
	}
	var skillsDecoded []skillRow
	if len(rawSk) > 0 {
		_ = json.Unmarshal(rawSk, &skillsDecoded)
	}

	// Filter skills: keep soft/language always, keep technical if in selectedSkillNames.
	skillNameSet := make(map[string]bool, len(selectedSkillNames))
	for _, n := range selectedSkillNames {
		skillNameSet[n] = true
	}
	var filteredSkills []skillRow
	for _, s := range skillsDecoded {
		if s.Category == "soft" || s.Category == "language" || skillNameSet[s.Name] {
			filteredSkills = append(filteredSkills, s)
		}
	}
	finalSkills := filteredSkills
	if len(finalSkills) == 0 {
		finalSkills = skillsDecoded
	}

	// Decode education.
	var educationDecoded []any
	if len(rawEdu) > 0 {
		_ = json.Unmarshal(rawEdu, &educationDecoded)
	}

	// Decode certificates.
	var certsDecoded []any
	if len(rawCert) > 0 {
		_ = json.Unmarshal(rawCert, &certsDecoded)
	}

	// Build personalInfo: use profile's, fill from user row if firstName/email missing.
	var personalInfo map[string]any
	if len(rawPI) > 0 {
		_ = json.Unmarshal(rawPI, &personalInfo)
	}
	if personalInfo == nil {
		personalInfo = map[string]any{}
	}
	fn, _ := personalInfo["firstName"].(string)
	em, _ := personalInfo["email"].(string)
	if fn == "" || em == "" {
		var userName *string
		var userEmail string
		_ = g.Store.Pool.QueryRow(ctx, `SELECT name, email FROM "user" WHERE id=$1`, userID).Scan(&userName, &userEmail)
		if fn == "" && userName != nil && *userName != "" {
			names := strings.SplitN(*userName, " ", 2)
			personalInfo["firstName"] = names[0]
			if len(names) > 1 {
				personalInfo["lastName"] = names[1]
			}
		}
		if em == "" {
			personalInfo["email"] = userEmail
		}
	}

	finalTitle := selTitle
	if finalTitle == "" {
		if targetRole != "" {
			finalTitle = targetRole + " Resume"
		} else {
			finalTitle = "My Resume"
		}
	}

	// 8. UPDATE stub with real data.
	finalExpJSON, _ := json.Marshal(finalExp)
	finalSkillsJSON, _ := json.Marshal(finalSkills)
	finalEduJSON, _ := json.Marshal(educationDecoded)
	finalCertsJSON, _ := json.Marshal(certsDecoded)
	piJSON, _ := json.Marshal(personalInfo)

	if _, updateErr := g.Store.Pool.Exec(ctx,
		`UPDATE "Resume" SET title=$1,"personalInfo"=$2::jsonb,"workExperience"=$3::jsonb,
		 education=$4::jsonb,skills=$5::jsonb,certificates=$6::jsonb,"updatedAt"=now() WHERE id=$7`,
		finalTitle, string(piJSON), string(finalExpJSON),
		string(finalEduJSON), string(finalSkillsJSON), string(finalCertsJSON),
		stubID,
	); updateErr != nil {
		_, _ = g.Store.Pool.Exec(context.Background(), `DELETE FROM "Resume" WHERE id=$1`, stubID)
		return "", "", &store.Error{Status: 500, Message: "Failed to generate resume"}
	}

	return stubID, finalTitle, nil
}

// buildProfileMap decodes raw jsonb fields into a map[string]any suitable for prompts.Selection.
// Since Selection ultimately re-serializes with canonical key order, using map[string]any here is fine
// (the canonical serializer in prompts/selection.go handles ordering).
// For TOON encoding, use EncodeTOONFromJSON with the raw bytes instead.
func buildProfileMap(pi, we, edu, sk []byte) map[string]any {
	decode := func(b []byte, def any) any {
		if len(b) == 0 {
			return def
		}
		var v any
		if err := json.Unmarshal(b, &v); err != nil {
			return def
		}
		return v
	}
	return map[string]any{
		"personalInfo":   decode(pi, map[string]any{}),
		"workExperience": decode(we, []any{}),
		"education":      decode(edu, []any{}),
		"skills":         decode(sk, []any{}),
	}
}
