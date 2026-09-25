## Agent server parity (Go ↔ Next)

Agent traffic is served by the Go service in `mcp-gateway/` (agents.gethired.work),
human traffic by Next. Some logic exists in both on purpose.

- Any change to a file with a `// PARITY:` header must be mirrored in its twin in the same commit.
- Full map: `mcp-gateway/PARITY.md`.
- After changing any prompt: `npx vitest run src/lib/ai/prompts/__golden__`, then
  `cd mcp-gateway && go test ./internal/prompts/` must pass.
- DB schema is owned by Prisma. After a migration touching `user`, `agent_token`,
  `agent_request_event`, `ai_usage_event`, `user_ai_key`, `Resume`, `cover_letter`,
  `user_profile`, update the Go SQL in `mcp-gateway/internal/`.
- New MCP tool or REST agent route: add it in Go only (Next agent routes are gone,
  except PDF).
- The kill switch is AGENTS_DISABLED=1 in the VPS .env (mcp-gateway/.env.example).

## Checks (for coder / reviewer / runner agents)

- Next: `npx tsc --noEmit -p .` (errors under `.next/` are stale generated types — ignore), `npx vitest run`.
- Go agent server: `go -C mcp-gateway vet ./...`,
  `TEST_DATABASE_URL=postgres://postgres:pg@localhost:55432/postgres go -C mcp-gateway test -count=1 ./...`
  (local throwaway Postgres container `gh-testdb`, schema via `prisma db push` — see `mcp-gateway/README.md`),
  linux build `CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go -C mcp-gateway build -o /dev/null .`.
- New user-facing strings go into `src/lib/translations-data.ts` with `en`, `uk`, `ru`.

## Go SQL traps (Prisma-owned schema)

- Tables: `"user"`, `agent_token`, `agent_request_event`, `ai_usage_event`, `user_ai_key`, `"Resume"`, `cover_letter`, `user_profile`.
- Columns are camelCase and must be quoted (`"userId"`, `"updatedAt"`).
- `@default(cuid())` and `@updatedAt` are client-side → Go generates ids with `cuid.New()` and sets `"updatedAt" = now()`.
- Supabase pooler (6543) = pgbouncer transaction mode → pgx simple protocol, no prepared statements.
