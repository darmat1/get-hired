package rest

import (
	"encoding/json"
	"net/http"

	"mcp-gateway/internal/auth"
)

func (a *API) HandleProfile(w http.ResponseWriter, r *http.Request) {
	ctx := a.authenticate(w, r)
	if ctx == nil {
		return
	}

	if r.Method == "GET" {
		if !hasScope(w, ctx, auth.ProfileRead) {
			return
		}
		profile, err := a.Store.GetProfile(r.Context(), ctx.UserID)
		if err != nil {
			writeStoreError(w, err)
			return
		}
		jsonResponse(w, profile, http.StatusOK)
		return
	}

	if r.Method == "PATCH" {
		if !hasScope(w, ctx, auth.ProfileWrite) {
			return
		}
		var body map[string]any
		// TS: `await request.json()` inside try → invalid or empty body = 500.
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			jsonError(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		profile, err := a.Store.UpdateProfile(r.Context(), ctx.UserID, body)
		if err != nil {
			writeStoreError(w, err)
			return
		}
		jsonResponse(w, profile, http.StatusOK)
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
}
