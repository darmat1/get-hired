package auth

import (
	"context"
	"testing"
	"time"

	"mcp-gateway/internal/db"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lucsky/cuid"
)

func mustExec(t *testing.T, pool *pgxpool.Pool, sql string, args ...any) {
	t.Helper()
	if _, err := pool.Exec(context.Background(), sql, args...); err != nil {
		t.Fatal(err)
	}
}

func TestHashTokenMatchesNode(t *testing.T) {
	// node -e 'require("crypto").createHash("sha256").update("agt_test_token").digest("hex")'
	want := "dde1b10aaa4f875272d2a1d97b38b867805ff3c326d677231b0a21aab1d1ac1d"
	if got := HashToken("agt_test_token"); got != want {
		t.Fatalf("got %s", got)
	}
}

func TestHas(t *testing.T) {
	c := &Context{Scopes: []Scope{ResumesRead}}
	if !c.Has(ResumesRead) || c.Has(ResumesWrite) {
		t.Fatal("scope check wrong")
	}
}

func TestAuthenticateRejectsNonAgentHeader(t *testing.T) {
	for _, h := range []string{"", "Bearer", "Bearer abc", "Basic agt_x"} {
		c, err := Authenticate(context.Background(), nil, h, "rest", "/x")
		if c != nil || err != nil {
			t.Fatalf("%q: want nil,nil got %v,%v", h, c, err)
		}
	}
}

func TestAuthenticateDB(t *testing.T) {
	pool := db.ForTest(t)
	ctx := context.Background()
	userID, tokenID := cuid.New(), cuid.New()
	raw := "agt_" + cuid.New()
	mustExec(t, pool, `INSERT INTO "user"(id,email,"updatedAt") VALUES($1,$2,now())`, userID, userID+"@t.dev")
	mustExec(t, pool, `INSERT INTO agent_token(id,"userId",name,"tokenHash","tokenPrefix",scopes) VALUES($1,$2,'t',$3,'agt_',$4)`,
		tokenID, userID, HashToken(raw), []string{"resumes:read"})
	t.Cleanup(func() { mustExec(t, pool, `DELETE FROM "user" WHERE id=$1`, userID) })

	c, err := Authenticate(ctx, pool, "Bearer "+raw, "mcp", "list_resumes")
	if err != nil || c == nil || c.UserID != userID || !c.Has(ResumesRead) {
		t.Fatalf("got %+v %v", c, err)
	}
	time.Sleep(200 * time.Millisecond) // lastUsedAt update may be async
	var n int
	_ = pool.QueryRow(ctx, `SELECT count(*) FROM agent_request_event WHERE "tokenId"=$1 AND transport='mcp' AND route='list_resumes'`, tokenID).Scan(&n)
	if n != 1 {
		t.Fatalf("events=%d", n)
	}

	mustExec(t, pool, `UPDATE agent_token SET "revokedAt"=now() WHERE id=$1`, tokenID)
	if c, _ := Authenticate(ctx, pool, "Bearer "+raw, "mcp", "x"); c != nil {
		t.Fatal("revoked token accepted")
	}
}
