// PARITY: src/app/api/agent/v1/templates/route.ts — keep in sync, see mcp-gateway/PARITY.md
package rest

import (
	"net/http"

	"mcp-gateway/internal/store"
)

func (a *API) HandleTemplates(w http.ResponseWriter, r *http.Request) {
	ctx := a.authenticate(w, r)
	if ctx == nil {
		return
	}

	if r.Method == "GET" {
		jsonResponse(w, store.Templates(), http.StatusOK)
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
}
