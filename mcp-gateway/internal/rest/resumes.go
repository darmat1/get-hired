package rest

import (
	"encoding/json"
	"net/http"

	"mcp-gateway/internal/auth"
	"mcp-gateway/internal/gen"
)

func (a *API) HandleResumes(w http.ResponseWriter, r *http.Request) {
	ctx := a.authenticate(w, r)
	if ctx == nil {
		return
	}

	if r.Method == "GET" {
		if !hasScope(w, ctx, auth.ResumesRead) {
			return
		}
		resumes, err := a.Store.ListResumes(r.Context(), ctx.UserID)
		if err != nil {
			writeStoreError(w, err)
			return
		}
		jsonResponse(w, resumes, http.StatusOK)
		return
	}

	if r.Method == "POST" {
		if !hasScope(w, ctx, auth.ResumesWrite) {
			return
		}
		var body map[string]any
		// TS: `await request.json()` inside try → invalid or empty body = 500.
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			jsonError(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		resume, err := a.Store.CreateResume(r.Context(), ctx.UserID, body)
		if err != nil {
			writeStoreError(w, err)
			return
		}
		jsonResponse(w, resume, http.StatusCreated)
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
}

func (a *API) HandleResume(w http.ResponseWriter, r *http.Request) {
	ctx := a.authenticate(w, r)
	if ctx == nil {
		return
	}

	id := r.PathValue("id")

	if r.Method == "GET" {
		if !hasScope(w, ctx, auth.ResumesRead) {
			return
		}
		resume, err := a.Store.GetResume(r.Context(), ctx.UserID, id)
		if err != nil {
			writeStoreError(w, err)
			return
		}
		jsonResponse(w, resume, http.StatusOK)
		return
	}

	if r.Method == "PATCH" {
		if !hasScope(w, ctx, auth.ResumesWrite) {
			return
		}
		var body map[string]any
		// TS: `await request.json()` inside try → invalid or empty body = 500.
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			jsonError(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		resume, err := a.Store.UpdateResume(r.Context(), ctx.UserID, id, body)
		if err != nil {
			writeStoreError(w, err)
			return
		}
		jsonResponse(w, resume, http.StatusOK)
		return
	}

	if r.Method == "DELETE" {
		if !hasScope(w, ctx, auth.ResumesWrite) {
			return
		}
		err := a.Store.DeleteResume(r.Context(), ctx.UserID, id)
		if err != nil {
			writeStoreError(w, err)
			return
		}
		jsonResponse(w, map[string]bool{"success": true}, http.StatusOK)
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
}

func (a *API) HandleGenerateResume(w http.ResponseWriter, r *http.Request) {
	ctx := a.authenticate(w, r)
	if ctx == nil {
		return
	}

	if r.Method == "POST" {
		if !hasScope(w, ctx, auth.AIGenerate) {
			jsonError(w, "Missing required scope: ai:generate", http.StatusForbidden)
			return
		}
		if !hasScope(w, ctx, auth.ResumesWrite) {
			jsonError(w, "Missing required scope: resumes:write", http.StatusForbidden)
			return
		}

		var body struct {
			TargetRole     string `json:"targetRole"`
			JobDescription string `json:"jobDescription"`
			Template       string `json:"template"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil && err.Error() != "EOF" {
			// Ignore JSON errors as TS does: await request.json().catch(() => ({}))
		}

		id, title, err := a.Gen.Resume(r.Context(), ctx.UserID, gen.ResumeOpts{
			TargetRole:     body.TargetRole,
			JobDescription: body.JobDescription,
			Template:       body.Template,
		})
		if err != nil {
			writeStoreError(w, err)
			return
		}

		jsonResponse(w, map[string]string{
			"resumeId": id,
			"title":    title,
			"url":      "/resume/" + id + "/edit",
		}, http.StatusCreated)
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
}
