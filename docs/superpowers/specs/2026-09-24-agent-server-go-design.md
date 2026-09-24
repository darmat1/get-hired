# Agent server in Go — design

**Date:** 2026-09-24
**Branch:** `feat/mcp-gateway`
**Status:** approved in brainstorming, pending spec review

## Problem

Vercel CPU limits were fine until AI agents started using GetHired. Agents call the
API far more often than humans. The existing `mcp-gateway/` (Go, `mark3labs/mcp-go`)
only terminates the MCP transport and proxies every tool call back to
`/api/agent/v1/*` on Vercel, so all Prisma/AI/JSON work still runs on Vercel.
MCP is currently disabled on prod via the kill switch (`dda7aea`).

The VPS is too weak to host the whole Next.js app. Goal: split traffic — humans stay
on Vercel, agents go to the Go service on the VPS, which does the work itself.

## Scope

In the Go service:
- Agent token auth, scopes, `lastUsedAt`, `AgentRequestEvent` logging.
- Profile read/update, resume CRUD, cover letter CRUD, templates list.
- AI generation of resumes and cover letters (providers, fallback, user keys, free quota).
- MCP (all 16 current tools) and REST `/api/agent/v1/*`, both over the same service layer.
- Kill switch.

Out of scope:
- PDF rendering. Go proxies to Next (`/api/agent/v1/resumes/:id/pdf`). May move later.
- Human-facing routes, auth (`better-auth`), agent token management UI
  (`/api/account/agent-tokens`) — stay in Next.
- DB schema changes. Prisma owns the schema; Go never migrates.

## Architecture

```
agent ──► agents.gethired.work (Cloudflare → Caddy → Go, VPS)
            ├─ /api/agent/mcp   MCP (alias: /mcp)
            ├─ /api/agent/v1/*  REST
            ├─ /healthz
            ├─ Postgres (Supabase) via pgx
            ├─ AI providers via plain HTTP
            └─ PDF ──► https://gethired.work/api/agent/v1/resumes/:id/pdf

old URL gethired.work/api/agent/* ──► Next rewrite (edge, no function) ──► agents.gethired.work
```

Go paths mirror the Next paths 1:1, so the rewrite is a plain host swap.

## Go modules (`mcp-gateway/internal/`)

| Package | Next twin | Responsibility |
|---|---|---|
| `db` | `src/lib/prisma.ts` | pgx pool. Supabase pooler port 6543 is transaction-mode pgbouncer → use simple protocol / no prepared statement cache. |
| `auth` | `src/lib/agent-auth.ts`, `src/lib/agent-scopes.ts` | Bearer `agt_…` → `sha256` hex → lookup token row, check revoked/expired, scopes, `lastUsedAt` throttled 5 min, insert `AgentRequestEvent` (transport `mcp`/`rest`, route). |
| `store` | `src/app/api/agent/v1/*` (CRUD parts) | Profile get/partial update; resume list/get/create (max 2 per user, prefill from profile)/update/delete; cover letter list/get/create/update/delete; static templates list (mirrors `TEMPLATES` in the MCP route). Same validation rules and error messages as the TS routes. |
| `ai` | `src/lib/ai/server-ai.ts`, `src/lib/ai/registry.ts`, `src/lib/ai/providers/*`, `src/lib/encryption.ts`, `src/lib/ai/parse-json-response.ts` | 5 providers (OpenRouter, Gemini, Groq, OpenAI, Claude) over HTTP, no SDKs. Order from `AI_PROVIDER_ORDER` else registry order; same fallback and model mapping as `aiComplete`. User API keys decrypted with AES-256-GCM, format `iv:authTag:cipher` (hex), key = `ENCRYPTION_KEY` (64 hex). Free quota: 10 generations per 7 days, same counters as `getFreeQuotaCount`. |
| `prompts` | `src/lib/ai/prompts/cover-letter.ts`, `shared-career-context.ts`, `job-archetypes.ts`, `buildSelectionPrompt` in `src/lib/agent/resume-generation.ts` | Prompt text ported verbatim. |
| `gen` | `src/lib/agent/resume-generation.ts`, `src/lib/agent/cover-letter-generation.ts` | `generateResumeForUser`, `generateCoverLetterForUser` with `source: "agent"`. |
| `mcp` | `src/app/api/agent/mcp/route.ts` | Tool definitions (names, descriptions, schemas identical), scope checks, calls `store`/`gen`. Stateless, heartbeat 15 s, localhost protection disabled (behind Caddy). |
| `rest` | `src/app/api/agent/v1/*` | Same routes, methods, status codes and JSON shapes. PDF route proxies to Next forwarding the bearer token and `X-Agent-Transport`; Go does not log an event for it (Next does). |
| (main) | kill switch in `dda7aea` | `AGENTS_DISABLED=1` → 503 on all agent routes. |

The existing `proxy.go` REST-forwarding path is removed except for the PDF proxy.

## Parity rule

Logic under `gen`, `prompts`, `ai`, `auth` is shared with human routes in Next
(`/api/ai/create-resume` uses `generateResumeForUser`; `/api/account/generate-cover-letter`
uses the cover letter prompts), so it lives in two places by design.

1. `CLAUDE.md` gets an "Agent server parity" section: editing any file in the table
   above requires the matching change in its twin in the same commit.
2. Every twin file gets a header comment: TS `// PARITY: mcp-gateway/internal/<pkg>/…`,
   Go `// PARITY: src/…`.
3. `mcp-gateway/PARITY.md` — the table above at function level.

## Next.js changes (cutover commit)

- `next.config`: rewrite `/api/agent/:path*` → `https://agents.gethired.work/api/agent/:path*`.
  Default (afterFiles) rewrites only apply when no route matches, so the kept PDF route
  still serves from Next and there is no loop.
- Delete `src/app/api/agent/mcp` and `src/app/api/agent/v1/*` except `resumes/[id]/pdf`.
- Remove the Next kill switch (moved to Go).
- Keep `src/lib/agent/*`, `src/lib/ai/*` (used by human routes); add `PARITY` headers.
- `/agents` page and `llms.txt`: show `https://agents.gethired.work/api/agent/mcp`.

## Deploy

Same as today: `amd64` image tarball → `docker load` → `docker compose up -d`.
- `.env` on VPS now holds secrets: `DATABASE_URL`, `ENCRYPTION_KEY`, AI provider keys,
  `AI_PROVIDER_ORDER` (optional), `GETHIRED_BASE_URL`, `AGENTS_DISABLED` (optional).
  README's "holds no secrets" section is rewritten accordingly.
- `mem_limit` 64m → 128m.
- Caddy, DNS, Cloudflare unchanged.

## Cutover order

1. Deploy Go to VPS; Next unchanged. User checks `curl https://agents.gethired.work/healthz`
   and one `list_resumes` call with their own token.
2. Merge the Next cutover commit.
3. `/agents` + `llms.txt` update (can ship with step 2).

Rollback: `git revert` the cutover commit (Next routes come back, rewrite gone).
Emergency stop: `AGENTS_DISABLED=1` on the VPS.

## Testing

Go unit tests, no live DB or AI calls (no spend):
- `auth`: token hashing, scope checks, expired/revoked handling.
- `ai`: decrypt against a test vector produced by the TS `encrypt`; free quota window math;
  provider order and fallback with fake providers.
- `prompts`: prompt assembly for fixed inputs.
- `rest`/`mcp`: handler wiring with a fake store.

Live check is the user's two-call smoke test in cutover step 1.
