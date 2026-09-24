// PARITY: src/app/api/agent/v1/cover-letters/route.ts, src/app/api/agent/v1/cover-letters/[id]/route.ts — keep in sync, see mcp-gateway/PARITY.md
package rest

import (
	"encoding/json"
	"net/http"

	"mcp-gateway/internal/auth"
	"mcp-gateway/internal/gen"
)

func (a *API) HandleCoverLetters(w http.ResponseWriter, r *http.Request) {
	ctx := a.authenticate(w, r)
	if ctx == nil {
		return
	}

	if r.Method == "GET" {
		if !hasScope(w, ctx, auth.CoverLettersRead) {
			return
		}
		cls, err := a.Store.ListCoverLetters(r.Context(), ctx.UserID)
		if err != nil {
			writeStoreError(w, err)
			return
		}
		jsonResponse(w, cls, http.StatusOK)
		return
	}

	if r.Method == "POST" {
		if !hasScope(w, ctx, auth.CoverLettersWrite) {
			return
		}
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil && err.Error() != "EOF" {
			body = map[string]any{}
		}
		if body["jobDescription"] == nil || body["jobDescription"] == "" || body["coverLetterText"] == nil || body["coverLetterText"] == "" {
			jsonError(w, "jobDescription and coverLetterText are required", http.StatusBadRequest)
			return
		}
		cl, err := a.Store.CreateCoverLetter(r.Context(), ctx.UserID, body)
		if err != nil {
			writeStoreError(w, err)
			return
		}
		jsonResponse(w, cl, http.StatusCreated)
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
}

func (a *API) HandleCoverLetter(w http.ResponseWriter, r *http.Request) {
	ctx := a.authenticate(w, r)
	if ctx == nil {
		return
	}

	id := r.PathValue("id")

	if r.Method == "GET" {
		if !hasScope(w, ctx, auth.CoverLettersRead) {
			return
		}
		cl, err := a.Store.GetCoverLetter(r.Context(), ctx.UserID, id)
		if err != nil {
			writeStoreError(w, err)
			return
		}
		jsonResponse(w, cl, http.StatusOK)
		return
	}

	if r.Method == "PATCH" {
		if !hasScope(w, ctx, auth.CoverLettersWrite) {
			return
		}
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil && err.Error() != "EOF" {
			body = map[string]any{}
		}
		cl, err := a.Store.UpdateCoverLetter(r.Context(), ctx.UserID, id, body)
		if err != nil {
			writeStoreError(w, err)
			return
		}
		jsonResponse(w, cl, http.StatusOK)
		return
	}

	if r.Method == "DELETE" {
		if !hasScope(w, ctx, auth.CoverLettersWrite) {
			return
		}
		err := a.Store.DeleteCoverLetter(r.Context(), ctx.UserID, id)
		if err != nil {
			writeStoreError(w, err)
			return
		}
		jsonResponse(w, map[string]bool{"success": true}, http.StatusOK)
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
}

func (a *API) HandleGenerateCoverLetter(w http.ResponseWriter, r *http.Request) {
	ctx := a.authenticate(w, r)
	if ctx == nil {
		return
	}

	if r.Method == "POST" {
		if !hasScope(w, ctx, auth.AIGenerate) {
			jsonError(w, "Missing required scope: ai:generate", http.StatusForbidden)
			return
		}
		if !hasScope(w, ctx, auth.CoverLettersWrite) {
			jsonError(w, "Missing required scope: cover_letters:write", http.StatusForbidden)
			return
		}

		var body struct {
			JobDescription string `json:"jobDescription"`
			Format         string `json:"format"`
			Language       string `json:"language"`
			ResumeID       string `json:"resumeId"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil && err.Error() != "EOF" {
			// ignore
		}

		id, text, err := a.Gen.CoverLetter(r.Context(), ctx.UserID, gen.CoverLetterOpts{
			JobDescription: body.JobDescription,
			Format:         body.Format,
			Language:       body.Language,
			ResumeID:       body.ResumeID,
		})
		if err != nil {
			writeStoreError(w, err)
			return
		}

		jsonResponse(w, map[string]string{
			"coverLetterId":   id,
			"coverLetterText": text,
		}, http.StatusCreated)
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
}
