package rest

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lucsky/cuid"
	"mcp-gateway/internal/auth"
	"mcp-gateway/internal/db"
	"mcp-gateway/internal/gen"
	"mcp-gateway/internal/store"
)

func mustExec(t *testing.T, pool *pgxpool.Pool, sql string, args ...any) {
	t.Helper()
	_, err := pool.Exec(context.Background(), sql, args...)
	if err != nil {
		t.Fatalf("mustExec failed: %v", err)
	}
}

func TestRESTHandlers(t *testing.T) {
	pool := db.ForTest(t)
	api := &API{
		Pool:  pool,
		Store: &store.Store{Pool: pool},
		Gen:   &gen.Gen{Store: &store.Store{Pool: pool}},
	}

	mux := http.NewServeMux()
	api.RegisterHandlers(mux)

	// unauthenticated GET /api/agent/v1/profile
	req1 := httptest.NewRequest("GET", "/api/agent/v1/profile", nil)
	w1 := httptest.NewRecorder()
	mux.ServeHTTP(w1, req1)
	if w1.Result().StatusCode != 401 {
		t.Errorf("unauth status %d, want 401", w1.Result().StatusCode)
	}
	var resp1 map[string]string
	json.NewDecoder(w1.Body).Decode(&resp1)
	if resp1["error"] != "Unauthorized" {
		t.Errorf("unauth error body: %v", resp1)
	}

	// Create test user and token
	userID, tokenID := cuid.New(), cuid.New()
	raw := "agt_" + cuid.New()
	mustExec(t, pool, `INSERT INTO "user"(id,email,"updatedAt") VALUES($1,$2,now())`, userID, userID+"@t.dev")
	// Token with only resumes:read
	mustExec(t, pool, `INSERT INTO agent_token(id,"userId",name,"tokenHash","tokenPrefix",scopes) VALUES($1,$2,'t',$3,'agt_',$4)`,
		tokenID, userID, auth.HashToken(raw), []string{"resumes:read"})
	t.Cleanup(func() { mustExec(t, pool, `DELETE FROM "user" WHERE id=$1`, userID) })

	// token without resumes:write -> POST /resumes
	req2 := httptest.NewRequest("POST", "/api/agent/v1/resumes", bytes.NewReader([]byte("{}")))
	req2.Header.Set("Authorization", "Bearer "+raw)
	w2 := httptest.NewRecorder()
	mux.ServeHTTP(w2, req2)
	if w2.Result().StatusCode != 403 {
		t.Errorf("scope error status %d, want 403", w2.Result().StatusCode)
	}
	var resp2 map[string]string
	json.NewDecoder(w2.Body).Decode(&resp2)
	if resp2["error"] != "Missing required scope: resumes:write" {
		t.Errorf("scope error body: %v", resp2)
	}

	// happy path GET /resumes
	req3 := httptest.NewRequest("GET", "/api/agent/v1/resumes", nil)
	req3.Header.Set("Authorization", "Bearer "+raw)
	w3 := httptest.NewRecorder()
	mux.ServeHTTP(w3, req3)
	if w3.Result().StatusCode != 200 {
		t.Errorf("GET resumes status %d, want 200", w3.Result().StatusCode)
	}
	var resp3 []any
	if err := json.NewDecoder(w3.Body).Decode(&resp3); err != nil {
		t.Fatalf("failed to decode GET resumes array: %v", err)
	}
}
