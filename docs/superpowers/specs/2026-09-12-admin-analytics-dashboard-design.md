# Admin analytics dashboard — design

## Context

GetHired has an `/admin` section gated to `admin`/`superadmin` roles (`src/app/admin/layout.tsx` → `AdminSidebar`), currently holding `/admin/blog` and `/admin/users`. There is no analytics surface: no way to see profile completion, resume/cover-letter generation volume, site activity, or how the agent-token feature (`AgentToken`, `/api/agent/v1/**`, `/api/agent/mcp`) is actually being used.

Some of the requested metrics are directly derivable from existing tables (`UserProfile`, `Resume`, `CoverLetter`, `AgentToken`). Others genuinely require new instrumentation because the data doesn't exist today:

- **Online / time-on-site** — Better Auth's `Session.updatedAt` only refreshes once per day (`updateAge: 60*60*24` in `src/lib/auth.ts`), useless as an "online now" or session-duration signal.
- **Which AI provider actually served a generation** — `AiCredential.provider` and `User.preferredAIProvider` show what a user *configured/prefers*, not what provider *actually completed* a given call. Nothing logs that today.
- **Agent connection frequency** — `AgentToken.lastUsedAt` is a single throttled (5 min) timestamp, not a request history.

Decisions from stakeholder discussion (all confirmed):
- Precise event tracking, not rough proxies, for the three gaps above.
- Resume/cover-letter analytics cover **all** creation paths (manual builder, AI generation, agent), broken down by source — not just full AI-generation.
- Trend range: 30 days default, switchable to 7/90.
- Online = heartbeat every 60s from an open tab; "online now" = activity within the last 5 minutes.
- Route: `/admin/dashboard`, rendered as text stat tiles + charts.

## Data model

Additions to `prisma/schema.prisma`, applied via `prisma db push` (this project's established workflow — **not** `prisma migrate dev`, which has no migration history here and would prompt a destructive full-schema reset against the shared Supabase DB).

```prisma
model Resume {
  // ...existing fields
  source String @default("manual") // "manual" | "ai_ui" | "agent"
}

model CoverLetter {
  // ...existing fields
  source String @default("manual") // "manual" | "ai_ui" | "agent"
}

model AiUsageEvent {
  id        String   @id @default(cuid())
  userId    String?
  provider  String
  model     String?
  createdAt DateTime @default(now())

  @@index([createdAt])
  @@index([provider, createdAt])
  @@map("ai_usage_event")
}

model UserVisit {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  startedAt  DateTime @default(now())
  lastSeenAt DateTime @default(now())

  @@index([userId, lastSeenAt])
  @@index([lastSeenAt])
  @@map("user_visit")
}

model AgentRequestEvent {
  id        String     @id @default(cuid())
  tokenId   String
  token     AgentToken @relation(fields: [tokenId], references: [id], onDelete: Cascade)
  userId    String
  transport String     // "mcp" | "rest"
  route     String     // MCP tool name, or REST path
  createdAt DateTime   @default(now())

  @@index([tokenId, createdAt])
  @@index([userId, createdAt])
  @@map("agent_request_event")
}
```

`User` gets a `visits UserVisit[]` back-relation; `AgentToken` gets a `requests AgentRequestEvent[]` back-relation. `AiUsageEvent.userId` stays a plain unindexed-relation string (no FK) — provider-usage stats should survive user deletion, and not every `aiComplete` caller reliably has a user.

`UserVisit` is a *session* record, not a per-heartbeat log: each heartbeat either extends the current visit's `lastSeenAt` (if the gap since the last one is under 5 minutes) or starts a new visit row. This bounds row growth to roughly one row per user per active stretch of browsing, not one row per 60-second tick — while still giving "online now" (`lastSeenAt` within 5 min), visit duration (`lastSeenAt - startedAt`), and visit frequency per user/day.

`AgentRequestEvent` has no pruning/retention policy in this pass — acceptable for a v1 admin dashboard, revisit if volume becomes a real storage concern.

## Instrumentation

All writes are fire-and-forget (`.catch(() => {})`), so analytics logging can never break the underlying feature.

1. **`UserVisit`** — new `POST /api/heartbeat` route, session-authenticated. Looks up the user's most recent `UserVisit`; if `now - lastSeenAt < 5min`, updates `lastSeenAt`; otherwise creates a new visit. Client side: a small component mounted once in the authenticated app shell, pinging every 60s while `document.visibilityState === "visible"` (paused when the tab is hidden).

2. **`AiUsageEvent`** — single hook inside `aiComplete()` (`src/lib/ai/server-ai.ts`), right before each of the two success `return response` statements (user-key path and system-provider path). This is the one choke point every AI call in the app passes through (`executeStructuredAI` → `aiComplete`), so it captures provider usage app-wide, not just resume/cover-letter generation.

3. **`Resume.source` / `CoverLetter.source`**:
   - `POST /api/resumes` (manual builder save) — default `"manual"`, no code change needed.
   - `generateResumeForUser(userId, opts)` gains `opts.source: "ai_ui" | "agent"`, threaded from its three callers: `/api/ai/create-resume` (`"ai_ui"`), `/api/agent/v1/resumes/generate` and the MCP `generate_resume` tool (`"agent"`).
   - `/api/agent/v1/resumes` POST (agent manual create) and the MCP `create_resume` tool set `source: "agent"` directly.
   - Same shape for `generateCoverLetterForUser` (agent-side) and `/api/account/generate-cover-letter` (UI AI-generation path, `"ai_ui"`); agent manual-create routes set `"agent"` directly.

4. **`AgentRequestEvent`** — hook inside `authenticateAgentRequest()` (`src/lib/agent-auth.ts`), alongside the existing throttled `lastUsedAt` update. Records `tokenId`, `userId`, `transport` (`"mcp"` if the request path is `/api/agent/mcp`, else `"rest"`), and `route` (MCP tool name or REST pathname).

## Aggregation / API

- `src/lib/admin/analytics.ts` — `getAnalyticsSummary(range: "7d" | "30d" | "90d")`, one server-side module doing all the Prisma reads (counts, `groupBy`, and `$queryRaw` with `date_trunc('day', ...)` for daily trends — no interpolated user input in the raw queries). Shared by both the initial server-rendered load and the client-side range switch, so the aggregation logic lives in exactly one place.
- `GET /api/admin/analytics?range=30d` — thin wrapper around `getAnalyticsSummary`, gated by the existing `getAdminSession()` pattern from `src/app/api/admin/users/route.ts`.

Metrics computed:
- **Profiles**: total users, users with a `UserProfile` row, completion breakdown (has work experience / education / skills, all non-empty JSON arrays).
- **Resumes / cover letters**: total, count in range, daily trend, breakdown by `source`.
- **Online**: online now (`UserVisit.lastSeenAt` within 5 min), daily unique visitors, average visit duration, visit frequency per user.
- **Agent tokens**: total created, active (no `revokedAt`), used in last 24h/7d/30d (via `lastUsedAt`), `AgentRequestEvent` daily trend, transport split (mcp/rest), top tools/routes.
- **Providers**: `AiUsageEvent` grouped by provider (and model), with a daily trend.

## UI

- `src/app/admin/dashboard/page.tsx` — async server component, same guard pattern as `BlogAdminPage` (`auth.api.getSession()` + role check + `redirect("/")` for non-admin/superadmin). Initial render calls `getAnalyticsSummary("30d")` directly — no HTTP round-trip for the first paint.
- Client-side range toggle (7/30/90 days) re-fetches via `/api/admin/analytics?range=`.
- New "Dashboard" entry in `AdminSidebar`, same role-gated visibility as the existing "Users" entry.
- Content: stat tiles (total users, % profiles filled, resumes total, cover letters total, active agent tokens, online now) plus charts: daily trend line (resumes / cover letters / visits), source breakdown (manual/ai_ui/agent) for resumes and cover letters, AI provider breakdown, agent connection frequency.
- No charting library is installed in the project (checked `package.json` — no recharts/chart.js/etc). Given the chart types needed (line trend, bar/pie breakdown), hand-rolled inline SVG is enough — adding a dependency for this isn't warranted. The `dataviz` skill must be invoked before writing any chart code (per its own trigger rule), which will guide palette/accessibility/layout.

## Out of scope

- Retention/pruning strategy for `AgentRequestEvent` and `AiUsageEvent`.
- Exporting analytics (CSV/PDF).
- Per-user drill-down analytics pages (this is aggregate, admin-wide).
- Real-time push updates to the dashboard (range switch is a manual re-fetch, not a live socket).
