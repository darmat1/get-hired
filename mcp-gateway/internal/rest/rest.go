package rest

import (
	"encoding/json"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"mcp-gateway/internal/auth"
	"mcp-gateway/internal/gen"
	"mcp-gateway/internal/store"
)

type API struct {
	Pool  *pgxpool.Pool
	Store *store.Store
	Gen   *gen.Gen
}

func jsonError(w http.ResponseWriter, msg string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func jsonResponse(w http.ResponseWriter, data any, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func (a *API) authenticate(w http.ResponseWriter, r *http.Request) *auth.Context {
	ctx, err := auth.Authenticate(r.Context(), a.Pool, r.Header.Get("Authorization"), "rest", r.URL.Path)
	if err != nil || ctx == nil {
		jsonError(w, "Unauthorized", http.StatusUnauthorized)
		return nil
	}
	return ctx
}

func hasScope(w http.ResponseWriter, ctx *auth.Context, scope auth.Scope) bool {
	if !ctx.Has(scope) {
		jsonError(w, "Missing required scope: "+string(scope), http.StatusForbidden)
		return false
	}
	return true
}

func writeStoreError(w http.ResponseWriter, err error) {
	if se, ok := err.(*store.Error); ok {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(se.Status)
		resp := map[string]any{"error": se.Message}
		for k, v := range se.Extra {
			resp[k] = v
		}
		json.NewEncoder(w).Encode(resp)
		return
	}
	jsonError(w, "Internal server error", http.StatusInternalServerError)
}

func (a *API) RegisterHandlers(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/agent/v1/profile", a.HandleProfile)
	mux.HandleFunc("PATCH /api/agent/v1/profile", a.HandleProfile)

	mux.HandleFunc("GET /api/agent/v1/resumes", a.HandleResumes)
	mux.HandleFunc("POST /api/agent/v1/resumes", a.HandleResumes)
	mux.HandleFunc("POST /api/agent/v1/resumes/generate", a.HandleGenerateResume)
	mux.HandleFunc("GET /api/agent/v1/resumes/{id}", a.HandleResume)
	mux.HandleFunc("PATCH /api/agent/v1/resumes/{id}", a.HandleResume)
	mux.HandleFunc("DELETE /api/agent/v1/resumes/{id}", a.HandleResume)

	mux.HandleFunc("GET /api/agent/v1/cover-letters", a.HandleCoverLetters)
	mux.HandleFunc("POST /api/agent/v1/cover-letters", a.HandleCoverLetters)
	mux.HandleFunc("POST /api/agent/v1/cover-letters/generate", a.HandleGenerateCoverLetter)
	mux.HandleFunc("GET /api/agent/v1/cover-letters/{id}", a.HandleCoverLetter)
	mux.HandleFunc("PATCH /api/agent/v1/cover-letters/{id}", a.HandleCoverLetter)
	mux.HandleFunc("DELETE /api/agent/v1/cover-letters/{id}", a.HandleCoverLetter)

	mux.HandleFunc("GET /api/agent/v1/templates", a.HandleTemplates)
}
