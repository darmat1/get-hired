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
