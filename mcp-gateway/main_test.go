package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"mcp-gateway/internal/config"
)

func TestKillSwitchAndHealthz(t *testing.T) {
	h := newMux(config.Config{AgentsDisabled: true}, nil, nil, nil)
	for _, p := range []string{"/api/agent/v1/profile", "/api/agent/mcp", "/mcp"} {
		w := httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequest("GET", p, nil))
		if w.Code != http.StatusServiceUnavailable || w.Body.String() != `{"error":"MCP agent access is temporarily disabled"}` {
			t.Fatalf("%s: %d %s", p, w.Code, w.Body.String())
		}
	}
	w := httptest.NewRecorder()
	h.ServeHTTP(w, httptest.NewRequest("GET", "/healthz", nil))
	if w.Code != 200 || w.Body.String() != "ok" {
		t.Fatalf("healthz: %d %s", w.Code, w.Body.String())
	}
}
