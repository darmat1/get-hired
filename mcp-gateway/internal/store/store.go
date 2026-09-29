// PARITY: src/app/api/agent/v1/{profile,resumes,cover-letters,templates}/route.ts — keep in sync, see mcp-gateway/PARITY.md
package store

import (
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Store provides CRUD operations for profile, resumes, cover letters, and templates.
type Store struct {
	Pool *pgxpool.Pool
}

// Error carries the HTTP status code and message that the TS route returns.
type Error struct {
	Status  int
	Message string
	Extra   map[string]any // e.g. {"limitReached": true}
}

func (e *Error) Error() string {
	return fmt.Sprintf("store error %d: %s", e.Status, e.Message)
}
