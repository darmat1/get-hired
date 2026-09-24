# mcp-gateway — agent API server

Serves get-hired's agent API from a small VPS at `agents.gethired.work`:

- `/api/agent/mcp` (alias `/mcp`) — MCP over Streamable HTTP, 16 tools
- `/api/agent/v1/*` — REST
- `/healthz` — `ok`

Humans stay on Vercel; agents come here. The old URL
`gethired.work/api/agent/*` is rewritten to this host at Vercel's edge (no
function invocation), so existing agent configs keep working.

## What it does itself, what it proxies

It talks to Postgres (Supabase) and the AI providers **directly**: token
auth and scopes, `agent_request_event` logging, profile / resume / cover
letter CRUD, AI generation (provider fallback, users' own keys, free
quota). Only **PDF rendering** is proxied back to Next
(`GETHIRED_BASE_URL/api/agent/v1/resumes/:id/pdf`), forwarding the bearer
token.

Some of this logic also exists in Next for human traffic. Keep both in
sync — see [PARITY.md](PARITY.md) and the "Agent server parity" section
in the root `CLAUDE.md`.

The process now holds secrets (DB URL, `ENCRYPTION_KEY`, provider keys):
keep `.env` at `chmod 600`, never commit it.

**Keep the 15s heartbeat** (`internal/mcp` `WithHeartbeatInterval`):
Cloudflare free/pro closes a connection after ~100s with no bytes, and
mcp-go sends no keep-alive by default.

## Local development

```bash
cp .env.example .env   # fill DATABASE_URL etc.
set -a; . ./.env; set +a
go run .
```

### Integration tests

DB tests skip unless `TEST_DATABASE_URL` is set. Local throwaway Postgres
with the Prisma schema (from the repo root):

```bash
docker run -d --name gh-testdb -p 55432:5432 -e POSTGRES_PASSWORD=pg postgres:16
DATABASE_URL=postgres://postgres:pg@127.0.0.1:55432/postgres DIRECT_URL=postgres://postgres:pg@127.0.0.1:55432/postgres npx prisma db push --skip-generate
cd mcp-gateway && TEST_DATABASE_URL=postgres://postgres:pg@localhost:55432/postgres go test ./...
```

Prompt parity: after changing any prompt in `src/lib/ai/prompts/`, run
`npx vitest run src/lib/ai/prompts/__golden__` (repo root), then
`go test ./internal/prompts/`.

No test calls a real AI provider.

## Deploying to the VPS (Docker)

**1. Build an amd64 image** (on the Mac):

```bash
cd mcp-gateway
docker buildx build --platform linux/amd64 -t mcp-gateway:latest --output type=docker,dest=mcp-gateway-amd64.tar .
```

**2. Copy** `mcp-gateway-amd64.tar`, `docker-compose.yml` and a filled
`.env` (from `.env.example`, same values as Vercel) to the VPS.

**3. Start:**

```bash
docker load -i mcp-gateway-amd64.tar
docker compose up -d
docker compose logs -f   # "mcp-gateway listening on :8080 ..."
```

`docker-compose.yml` binds to `127.0.0.1:8080`, `mem_limit: 128m`,
`restart: unless-stopped`, `env_file: .env`. Compose's `build: .` is only
used if you build on the VPS instead.

**4. Caddy + DNS** (unchanged if already set up): DNS A/AAAA
`agents.gethired.work` → VPS IP, block from `deploy/Caddyfile.snippet` in
`/etc/caddy/Caddyfile`, `sudo systemctl reload caddy`. Caddy handles TLS.

**5. Verify:**

```bash
curl https://agents.gethired.work/healthz    # -> ok
```

Then one `list_resumes` from an MCP client pointed at
`https://agents.gethired.work/api/agent/mcp` with a real agent token.

**Updating:** rebuild the tar, copy, `docker load`, `docker compose up -d`.

**Emergency stop:** `AGENTS_DISABLED=1` in `.env`, `docker compose up -d`
→ every agent route returns 503, `/healthz` still `ok`.

### Without Docker (systemd)

`deploy/mcp-gateway.service` still works: build with
`CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o mcp-gateway-linux-amd64 .`,
put the binary in `/opt/mcp-gateway/`, and the filled `.env` next to it
(`chmod 600`, owned by the service user).

## Client URL

New configs: `https://agents.gethired.work/api/agent/mcp`. Existing tokens
work unchanged. Claude Code:

```bash
claude mcp add --transport http get-hired-prod https://agents.gethired.work/api/agent/mcp \
  --header "Authorization: Bearer <token>"
```
