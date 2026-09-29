// PARITY: src/lib/agent-auth.ts, src/lib/agent-scopes.ts — keep in sync, see mcp-gateway/PARITY.md
package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lucsky/cuid"
)

type Scope string

const (
	ProfileRead       Scope = "profile:read"
	ProfileWrite      Scope = "profile:write"
	ResumesRead       Scope = "resumes:read"
	ResumesWrite      Scope = "resumes:write"
	CoverLettersRead  Scope = "cover_letters:read"
	CoverLettersWrite Scope = "cover_letters:write"
	AIGenerate        Scope = "ai:generate"
)

var allScopes = map[Scope]bool{
	ProfileRead: true, ProfileWrite: true, ResumesRead: true, ResumesWrite: true,
	CoverLettersRead: true, CoverLettersWrite: true, AIGenerate: true,
}

type Context struct {
	TokenID string
	UserID  string
	Scopes  []Scope
}

func HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func (c *Context) Has(s Scope) bool {
	for _, scope := range c.Scopes {
		if scope == s {
			return true
		}
	}
	return false
}

func Authenticate(ctx context.Context, pool *pgxpool.Pool, authHeader, transport, route string) (*Context, error) {
	if !strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
		return nil, nil
	}
	rawToken := strings.TrimSpace(authHeader[7:])
	if !strings.HasPrefix(rawToken, "agt_") {
		return nil, nil
	}

	tokenHash := HashToken(rawToken)

	var id, userID string
	var scopes []string
	var revokedAt, expiresAt, lastUsedAt *time.Time

	err := pool.QueryRow(ctx, `SELECT id, "userId", scopes, "revokedAt", "expiresAt", "lastUsedAt" FROM agent_token WHERE "tokenHash" = $1`, tokenHash).Scan(&id, &userID, &scopes, &revokedAt, &expiresAt, &lastUsedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		// Return error for DB failures other than not found? TS just throws and causes 500, which is fine,
		// but the prompt says "returns nil (no error) when the token is missing/unknown/revoked/expired — same as TS returning null".
		// For DB errors, TS throws an error, so we should return it.
		return nil, err
	}

	if revokedAt != nil {
		return nil, nil
	}
	if expiresAt != nil && expiresAt.Before(time.Now()) {
		return nil, nil
	}

	// Throttle lastUsedAt writes (5 minutes)
	if lastUsedAt == nil || time.Since(*lastUsedAt) > 5*time.Minute {
		// Fire and forget
		go func() {
			bgCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_, _ = pool.Exec(bgCtx, `UPDATE agent_token SET "lastUsedAt" = now() WHERE id = $1`, id)
		}()
	}

	// Insert event
	go func() {
		bgCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		eventID := cuid.New()
		_, err := pool.Exec(bgCtx, `INSERT INTO agent_request_event (id, "tokenId", "userId", transport, route) VALUES ($1, $2, $3, $4, $5)`, eventID, id, userID, transport, route)
		if err != nil {
			fmt.Println("EVENT INSERT ERROR:", err)
		}
	}()

	c := &Context{
		TokenID: id,
		UserID:  userID,
		Scopes:  make([]Scope, 0, len(scopes)),
	}
	for _, s := range scopes {
		if allScopes[Scope(s)] { // TS: scopes.filter(isAgentScope)
			c.Scopes = append(c.Scopes, Scope(s))
		}
	}

	return c, nil
}
