# mcp-gateway

A thin MCP-over-Streamable-HTTP front end for get-hired's agent API, meant
to run on a small VPS instead of Vercel.

## Why this exists

Vercel's Fluid Compute bills "active CPU" while a function is alive — and
the standalone MCP `GET` endpoint holds an SSE connection open for as long
as an agent stays connected. That's cheap on a normal server (just a
goroutine sitting idle) but adds up fast on Vercel's free tier.

This service does **not** reimplement get-hired's tools. It only:

1. Terminates the MCP transport (the long-lived SSE connection + JSON-RPC
   framing) — the part that's expensive to hold open on Vercel.
2. Translates each `tools/call` into a plain REST call against the
   existing `/api/agent/v1/*` API, forwarding the caller's bearer token
   unchanged.

All business logic — Prisma queries, AI generation, PDF rendering, scope
enforcement — stays on Vercel exactly as it is today. This process holds
**no secrets and no database connection**; if it's ever compromised, the
worst it can do is proxy requests using tokens callers already gave it —
the real REST API still checks and enforces those tokens' scopes itself.

## Local development

```bash
export GETHIRED_BASE_URL=http://localhost:3000   # your dev server
go run .
```

Then point an MCP client at `http://localhost:8080/mcp`.

## Deploying to the VPS

You'll need to do this part yourself — SSH access and DNS aren't
something this session has. Pick one of the two options below for step
1-3, then continue with step 4 either way.

One tradeoff worth knowing before choosing: Docker Engine's own daemon
sits at roughly 20-50MB RAM just running, on top of whatever the
container itself uses. This process idles at a few MB either way, so on
a genuinely tiny VPS the bare-binary/systemd path is the leaner choice;
Docker is here because it's easier to build and update consistently, not
because it's cheaper.

### Option A — bare binary + systemd (leanest)

**1. Build a Linux binary.** Check the VPS architecture first
(`ssh you@vps uname -m` — `x86_64` means `amd64`, `aarch64`/`arm64` means
`arm64`):

```bash
cd mcp-gateway
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o mcp-gateway-linux-amd64 .
```

**2. Copy it over:**

```bash
scp mcp-gateway-linux-amd64 you@your-vps:/tmp/mcp-gateway
```

**3. Install it as a systemd service.** On the VPS:

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin mcp-gateway
sudo mkdir -p /opt/mcp-gateway
sudo mv /tmp/mcp-gateway /opt/mcp-gateway/mcp-gateway
sudo chmod +x /opt/mcp-gateway/mcp-gateway
sudo chown -R mcp-gateway:mcp-gateway /opt/mcp-gateway

# Config
sudo tee /opt/mcp-gateway/.env <<'EOF'
GETHIRED_BASE_URL=https://gethired.work
PORT=8080
EOF
sudo chown mcp-gateway:mcp-gateway /opt/mcp-gateway/.env
sudo chmod 600 /opt/mcp-gateway/.env

sudo cp deploy/mcp-gateway.service /etc/systemd/system/mcp-gateway.service
sudo systemctl daemon-reload
sudo systemctl enable --now mcp-gateway
sudo systemctl status mcp-gateway   # should say "active (running)"
```

`deploy/mcp-gateway.service` caps it at 64MB RAM (`MemoryMax`) — this
process idles well under a few MB and only briefly allocates more while
proxying a request/response body, so this is a generous ceiling on a
2-euro VPS, not a tight one; raise it only if `systemctl status` shows
OOM kills.

**Updating later:** rebuild, `scp` over the old binary, then
`sudo systemctl restart mcp-gateway`. No DB migration, no env var
changes needed unless `GETHIRED_BASE_URL` itself changes.

### Option B — Docker

The image is a multi-stage build: `golang:1.25-alpine` to compile, then
a `FROM scratch` final stage with just the static binary and CA certs
(needed for the HTTPS calls this makes to `GETHIRED_BASE_URL`) — no
shell, no package manager, nothing else. Built and ran it locally to
confirm: **8.2MB image**, healthy, proxies real tool calls correctly.

**1. Get the code onto the VPS** (git clone, or `scp -r mcp-gateway/
you@your-vps:~/mcp-gateway`).

**2. Edit `docker-compose.yml`** if `GETHIRED_BASE_URL` needs to change
from the default (`https://gethired.work`).

**3. Build and start:**

```bash
cd mcp-gateway
docker compose up -d --build
docker compose logs -f   # should print "mcp-gateway listening on :8080 ..."
```

`docker-compose.yml` already sets `mem_limit: 64m` and
`restart: unless-stopped`.

**Updating later:**

```bash
git pull   # or re-copy the updated source
docker compose up -d --build
```

### 4. Point a subdomain at it

Add a DNS **A** record (and **AAAA** if the VPS has IPv6) for whatever
subdomain you want — `agents.gethired.work` matches the existing public
`/agents` page, so it's recognizable to people who've seen that page
already, unlike the more technical `mcp.gethired.work` — pointing at the
VPS's IP. Wait for it to propagate (`dig agents.gethired.work`).

If Caddy isn't already installed on the VPS:

```bash
sudo apt install -y caddy   # or the VPS distro's equivalent
```

Add the block from `deploy/Caddyfile.snippet` to `/etc/caddy/Caddyfile`
(swap in your real subdomain), then:

```bash
sudo systemctl reload caddy
```

Caddy issues and renews the TLS certificate automatically — nothing else
to configure, as long as the DNS record was already live when it requested
the cert.

### 5. Verify

```bash
curl https://agents.gethired.work/healthz    # -> ok
curl -sS -o /dev/null -w '%{http_code} %{time_starttransfer}s\n' \
  -H "Authorization: Bearer <a real agent token>" \
  -H "Accept: application/json, text/event-stream" \
  https://agents.gethired.work/mcp
# -> 200, headers well under 1s
```

### 6. Repoint clients

Existing agent tokens keep working unchanged — only the URL clients
connect to changes. For Claude Code:

```bash
claude mcp remove get-hired-prod   # or whatever the existing entry is named
claude mcp add --transport http get-hired-prod https://agents.gethired.work/mcp \
  --header "Authorization: Bearer <the existing token>"
```
