// Command mcp-gateway serves get-hired's agent API (MCP + REST
// /api/agent/v1/*) from a small VPS so agent traffic stops costing Vercel
// CPU. It talks to Postgres and the AI providers directly; only PDF
// rendering is proxied back to the Next app. See PARITY.md for the Next
// code each package mirrors.
package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	"mcp-gateway/internal/ai"
	"mcp-gateway/internal/config"
	"mcp-gateway/internal/db"
	"mcp-gateway/internal/gen"
	"mcp-gateway/internal/mcp"
	"mcp-gateway/internal/pdfproxy"
	"mcp-gateway/internal/rest"
	"mcp-gateway/internal/store"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	pool, err := db.Open(context.Background(), cfg.DatabaseURL)
	if err != nil {
		fmt.Fprintln(os.Stderr, "db:", err)
		os.Exit(1)
	}
	defer pool.Close()

	st := &store.Store{Pool: pool}
	g := &gen.Gen{Store: st, AI: &ai.Client{
		Pool: pool,
		// Registry order from src/lib/ai/registry.ts (ALL_PROVIDERS).
		Providers:  []ai.Provider{&ai.OpenRouterProvider{}, &ai.GeminiProvider{}, &ai.GroqProvider{}, &ai.OpenAIProvider{}, &ai.ClaudeProvider{}},
		Order:      cfg.ProviderOrder,
		ServerKeys: cfg.ProviderKeys,
		EncKey:     cfg.EncryptionKey,
	}}

	addr := ":" + cfg.Port
	fmt.Printf("mcp-gateway listening on %s (PDF via %s, disabled=%v)\n", addr, cfg.BaseURL, cfg.AgentsDisabled)
	if err := http.ListenAndServe(addr, newMux(cfg, pool, st, g)); err != nil {
		fmt.Fprintf(os.Stderr, "server error: %v\n", err)
		os.Exit(1)
	}
}

// newMux wires every route; split out of main so the kill switch and
// /healthz can be tested without a database.
func newMux(cfg config.Config, pool *pgxpool.Pool, st *store.Store, g *gen.Gen) http.Handler {
	agents := http.NewServeMux()
	(&rest.API{Pool: pool, Store: st, Gen: g}).RegisterHandlers(agents)
	agents.Handle("GET /api/agent/v1/resumes/{id}/pdf", &pdfproxy.Proxy{BaseURL: cfg.BaseURL, Transport: "rest"})
	mcpHandler := mcp.Handler(mcp.Deps{Pool: pool, Store: st, Gen: g, BaseURL: cfg.BaseURL})
	agents.Handle("/api/agent/mcp", mcpHandler)
	agents.Handle("/mcp", mcpHandler) // short alias

	root := http.NewServeMux()
	root.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("ok"))
	})
	root.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Kill switch, same status/body as the Next route had (dda7aea).
		if cfg.AgentsDisabled && (strings.HasPrefix(r.URL.Path, "/api/agent/") || r.URL.Path == "/mcp") {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			_, _ = w.Write([]byte(`{"error":"MCP agent access is temporarily disabled"}`))
			return
		}
		agents.ServeHTTP(w, r)
	})
	return root
}
