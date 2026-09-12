# Admin Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/admin/dashboard` — an admin-only page showing profile-completion, resume/cover-letter generation, site-activity, and AI-agent-usage analytics, as text stat tiles and charts.

**Architecture:** New Prisma models/fields capture the data that doesn't exist today (`Resume.source`/`CoverLetter.source`, `AiUsageEvent`, `UserVisit`, `AgentRequestEvent`), written at the existing choke points each already passes through (`aiComplete`, `authenticateAgentRequest`, the handful of resume/cover-letter creation routes). A single `getAnalyticsSummary()` module aggregates everything for both the server-rendered initial page load and a client-side range-switch API route.

**Tech Stack:** Next.js 16 App Router, Prisma/PostgreSQL, Vitest, hand-rolled inline SVG charts (no new dependency).

**Design spec:** `docs/superpowers/specs/2026-09-12-admin-analytics-dashboard-design.md`

---

## Task 1: Schema — new fields and models

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add `source` to `Resume` and `CoverLetter`, and the three new models**

In `prisma/schema.prisma`, add a `source` field to `model Resume` (after `customization Json?`):

```prisma
  customization  Json?
  source         String   @default("manual") // "manual" | "ai_ui" | "agent"
```

Add the same field to `model CoverLetter` (after `language String @default("en")`):

```prisma
  language        String   @default("en")
  source          String   @default("manual") // "manual" | "ai_ui" | "agent"
```

Add three new models anywhere after `model AgentToken` (e.g. right after it):

```prisma
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
  route     String
  createdAt DateTime   @default(now())

  @@index([tokenId, createdAt])
  @@index([userId, createdAt])
  @@map("agent_request_event")
}
```

Add the two back-relations. In `model User`, next to the existing `agentTokens AgentToken[]`:

```prisma
  agentTokens AgentToken[]
  visits      UserVisit[]
```

In `model AgentToken`, add a new line after `createdAt DateTime @default(now())`:

```prisma
  createdAt   DateTime  @default(now())
  requests    AgentRequestEvent[]
```

- [ ] **Step 2: Push the schema (NOT `prisma migrate dev` — no migration history exists in this project; that command prompts a destructive full-schema reset against the shared Supabase DB)**

Run:
```bash
npx prisma db push
```
Expected: `Your database is now in sync with your Prisma schema.` Then regenerate the client if it doesn't happen automatically:
```bash
npx prisma generate
```

- [ ] **Step 3: Verify the app still builds**

Run:
```bash
npx tsc --noEmit
```
Expected: no new errors (the new fields/models aren't referenced anywhere yet).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "$(cat <<'EOF'
feat(db): add analytics schema (source fields, AiUsageEvent, UserVisit, AgentRequestEvent)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Log every successful AI call → `AiUsageEvent`

**Files:**
- Modify: `src/lib/ai/server-ai.ts:150-167` and `:227-244` (the two success `return response` points inside `aiComplete`)

- [ ] **Step 1: Add the log call after the user-key success path**

In `src/lib/ai/server-ai.ts`, find:

```ts
              console.log(
                `[AI] Success (User Key): ${provider.name}, model: ${response.model}`,
              );
              return response;
```

Replace with:

```ts
              console.log(
                `[AI] Success (User Key): ${provider.name}, model: ${response.model}`,
              );
              prisma.aiUsageEvent
                .create({
                  data: { userId, provider: provider.id, model: response.model },
                })
                .catch(() => {});
              return response;
```

- [ ] **Step 2: Add the log call after the system-provider success path**

Find:

```ts
      console.log(
        `[AI] Success (System): ${provider.name}, model: ${response.model}`,
      );
      return response;
```

Replace with:

```ts
      console.log(
        `[AI] Success (System): ${provider.name}, model: ${response.model}`,
      );
      prisma.aiUsageEvent
        .create({
          data: { userId, provider: provider.id, model: response.model },
        })
        .catch(() => {});
      return response;
```

- [ ] **Step 3: Verify `prisma` is imported in this file**

Run:
```bash
grep -n 'import.*prisma' src/lib/ai/server-ai.ts
```
Expected: a line importing `prisma` from `@/lib/prisma` (it's already used elsewhere in this file for `prisma.user.findUnique`/`update`). If missing, add `import { prisma } from "@/lib/prisma";` near the top.

- [ ] **Step 4: Manual smoke test**

Run the dev server (`npm run dev`), trigger any AI action while signed in (e.g. generate a cover letter), then check:
```bash
npx prisma studio
```
Open the `ai_usage_event` table and confirm a row appeared with the right `provider`/`model`/`userId`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai/server-ai.ts
git commit -m "$(cat <<'EOF'
feat(analytics): log every successful AI provider call to AiUsageEvent

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Stamp `Resume.source` at every creation path

**Files:**
- Modify: `src/lib/agent/resume-generation.ts` (add `source` to `opts` and to the stub-create + update)
- Modify: `src/app/api/ai/create-resume/route.ts` (pass `source: "ai_ui"`)
- Modify: `src/app/api/agent/v1/resumes/route.ts` (pass `source: "agent"` on manual create)
- Modify: `src/app/api/agent/v1/resumes/generate/route.ts` (pass `source: "agent"`)
- Modify: `src/app/api/agent/mcp/route.ts` (`create_resume` and `generate_resume` tools)
- Modify: `src/app/api/account/generate-cover-letter/route.ts` (tailored-resume creation)

- [ ] **Step 1: Thread `source` through `generateResumeForUser`**

In `src/lib/agent/resume-generation.ts`, change the `opts` type on the function signature:

```ts
  opts: { targetRole?: string; jobDescription?: string; template?: string },
```
to:
```ts
  opts: {
    targetRole?: string;
    jobDescription?: string;
    template?: string;
    source?: "ai_ui" | "agent";
  },
```

Then find the stub-create inside the transaction:

```ts
    // Create a draft resume to atomically reserve our quota slot
    const stub = await tx.resume.create({
      data: {
        userId,
        title: "Generating...",
        template,
        language: "en",
        personalInfo: {},
        workExperience: [],
        education: [],
        skills: [],
      },
    });
```

and add `source`:

```ts
    // Create a draft resume to atomically reserve our quota slot
    const stub = await tx.resume.create({
      data: {
        userId,
        title: "Generating...",
        template,
        language: "en",
        personalInfo: {},
        workExperience: [],
        education: [],
        skills: [],
        source: opts.source || "ai_ui",
      },
    });
```

- [ ] **Step 2: Pass `source: "ai_ui"` from the UI create-resume route**

In `src/app/api/ai/create-resume/route.ts`, find:

```ts
    const result = await generateResumeForUser(session.user.id, {
      targetRole,
      jobDescription,
      template,
    });
```

Replace with:

```ts
    const result = await generateResumeForUser(session.user.id, {
      targetRole,
      jobDescription,
      template,
      source: "ai_ui",
    });
```

- [ ] **Step 3: Pass `source: "agent"` from the agent v1 generate route**

In `src/app/api/agent/v1/resumes/generate/route.ts`, find:

```ts
  const result = await generateResumeForUser(ctx.userId, {
    targetRole,
    jobDescription,
    template,
  });
```

Replace with:

```ts
  const result = await generateResumeForUser(ctx.userId, {
    targetRole,
    jobDescription,
    template,
    source: "agent",
  });
```

- [ ] **Step 4: Stamp `source: "agent"` on the agent v1 manual-create route**

In `src/app/api/agent/v1/resumes/route.ts`, find the `resume.create` call's `data` object — add `source: "agent"` right after `userId: ctx.userId,`:

```ts
        targetPosition: body.targetPosition,
        targetCompany: body.targetCompany,
        userId: ctx.userId,
      },
    });
```

Replace with:

```ts
        targetPosition: body.targetPosition,
        targetCompany: body.targetCompany,
        userId: ctx.userId,
        source: "agent",
      },
    });
```

- [ ] **Step 5: Stamp both resume-creating MCP tools**

In `src/app/api/agent/mcp/route.ts`, find the `create_resume` tool's `resume.create` call — add `source: "agent"` right after `userId: ctx.userId,`:

```ts
          targetPosition: args.targetPosition,
          targetCompany: args.targetCompany,
          userId: ctx.userId,
        },
      });
      return textResult(resume);
```

Replace with:

```ts
          targetPosition: args.targetPosition,
          targetCompany: args.targetCompany,
          userId: ctx.userId,
          source: "agent",
        },
      });
      return textResult(resume);
```

Then find the `generate_resume` tool's call:

```ts
      const result = await generateResumeForUser(ctx.userId, args);
```

Replace with:

```ts
      const result = await generateResumeForUser(ctx.userId, { ...args, source: "agent" });
```

- [ ] **Step 6: Stamp the tailored-resume creation inside the UI cover-letter route**

In `src/app/api/account/generate-cover-letter/route.ts`, find the `savedResume` creation:

```ts
      const savedResume = await (prisma.resume.create as any)({
        data: {
          title: resumeTitle,
          template: "professional",
          language: resumeJson.detectedLanguage || "en",
          personalInfo: resumeJson.personalInfo || {},
          workExperience: resumeJson.workExperience || [],
          education: resumeJson.education || [],
          skills: resumeJson.skills || [],
          certificates: resumeJson.certificates || [],
          targetPosition: resumeJson.targetPosition || null,
          targetCompany: resumeJson.targetCompany || null,
          userId: session.user.id,
        },
      });
```

Replace with:

```ts
      const savedResume = await (prisma.resume.create as any)({
        data: {
          title: resumeTitle,
          template: "professional",
          language: resumeJson.detectedLanguage || "en",
          personalInfo: resumeJson.personalInfo || {},
          workExperience: resumeJson.workExperience || [],
          education: resumeJson.education || [],
          skills: resumeJson.skills || [],
          certificates: resumeJson.certificates || [],
          targetPosition: resumeJson.targetPosition || null,
          targetCompany: resumeJson.targetCompany || null,
          userId: session.user.id,
          source: "ai_ui",
        },
      });
```

- [ ] **Step 7: Typecheck**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 8: Manual smoke test**

Create one resume manually in the builder, one via "Generate with AI" in the UI, and (if you have an agent token configured) one via `POST /api/agent/v1/resumes`. In `npx prisma studio`, confirm the three rows in `Resume` show `source` = `manual`, `ai_ui`, `agent` respectively.

- [ ] **Step 9: Commit**

```bash
git add src/lib/agent/resume-generation.ts src/app/api/ai/create-resume/route.ts src/app/api/agent/v1/resumes/route.ts src/app/api/agent/v1/resumes/generate/route.ts src/app/api/agent/mcp/route.ts src/app/api/account/generate-cover-letter/route.ts
git commit -m "$(cat <<'EOF'
feat(analytics): stamp Resume.source (manual/ai_ui/agent) at every creation path

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Stamp `CoverLetter.source` at every creation path

**Files:**
- Modify: `src/lib/agent/cover-letter-generation.ts`
- Modify: `src/app/api/agent/v1/cover-letters/route.ts`
- Modify: `src/app/api/agent/v1/cover-letters/generate/route.ts`
- Modify: `src/app/api/agent/mcp/route.ts` (`create_cover_letter` and `generate_cover_letter` tools)
- Modify: `src/app/api/account/generate-cover-letter/route.ts` (the `savedCoverLetter` creation)

- [ ] **Step 1: Thread `source` through `generateCoverLetterForUser`**

In `src/lib/agent/cover-letter-generation.ts`, change the `opts` type:

```ts
  opts: {
    jobDescription: string;
    format?: string;
    language?: string;
    resumeId?: string;
  },
```
to:
```ts
  opts: {
    jobDescription: string;
    format?: string;
    language?: string;
    resumeId?: string;
    source?: "ai_ui" | "agent";
  },
```

Then find the stub-create inside the transaction:

```ts
    // Create draft to reserve quota slot
    const stub = await tx.coverLetter.create({
      data: {
        userId,
        jobDescription,
        coverLetterText: "Generating...",
        format,
        language,
        resumeId: opts.resumeId || null,
      },
    });
```

Replace with:

```ts
    // Create draft to reserve quota slot
    const stub = await tx.coverLetter.create({
      data: {
        userId,
        jobDescription,
        coverLetterText: "Generating...",
        format,
        language,
        resumeId: opts.resumeId || null,
        source: opts.source || "ai_ui",
      },
    });
```

- [ ] **Step 2: Pass `source: "agent"` from the agent v1 generate route**

In `src/app/api/agent/v1/cover-letters/generate/route.ts`, find:

```ts
  const result = await generateCoverLetterForUser(ctx.userId, {
    jobDescription,
    format,
    language,
    resumeId,
  });
```

Replace with:

```ts
  const result = await generateCoverLetterForUser(ctx.userId, {
    jobDescription,
    format,
    language,
    resumeId,
    source: "agent",
  });
```

- [ ] **Step 3: Stamp `source: "agent"` on the agent v1 manual-create route**

In `src/app/api/agent/v1/cover-letters/route.ts`, find the `coverLetter.create` call:

```ts
  const coverLetter = await prisma.coverLetter.create({
    data: {
      jobDescription,
      coverLetterText,
      format: format || "bullet",
      language: language || "en",
      userId: ctx.userId,
      resumeId: resumeId || null,
    },
  });
```

Replace with:

```ts
  const coverLetter = await prisma.coverLetter.create({
    data: {
      jobDescription,
      coverLetterText,
      format: format || "bullet",
      language: language || "en",
      userId: ctx.userId,
      resumeId: resumeId || null,
      source: "agent",
    },
  });
```

- [ ] **Step 4: Stamp both cover-letter-creating MCP tools**

In `src/app/api/agent/mcp/route.ts`, find the `create_cover_letter` tool's `coverLetter.create` call:

```ts
      const coverLetter = await prisma.coverLetter.create({
        data: {
          jobDescription: args.jobDescription,
          coverLetterText: args.coverLetterText,
          format: args.format || "bullet",
          language: args.language || "en",
          userId: ctx.userId,
          resumeId: args.resumeId || null,
        },
      });
```

Replace with:

```ts
      const coverLetter = await prisma.coverLetter.create({
        data: {
          jobDescription: args.jobDescription,
          coverLetterText: args.coverLetterText,
          format: args.format || "bullet",
          language: args.language || "en",
          userId: ctx.userId,
          resumeId: args.resumeId || null,
          source: "agent",
        },
      });
```

Then find the `generate_cover_letter` tool's call:

```ts
      const result = await generateCoverLetterForUser(ctx.userId, args);
```

Replace with:

```ts
      const result = await generateCoverLetterForUser(ctx.userId, { ...args, source: "agent" });
```

- [ ] **Step 5: Stamp the UI cover-letter route's own creation**

In `src/app/api/account/generate-cover-letter/route.ts`, find:

```ts
    const savedCoverLetter = await prisma.coverLetter.create({
      data: {
        jobDescription,
        coverLetterText: result.coverLetter,
        format,
        language: language || "en",
        userId: session.user.id,
        resumeId: result.resumeId || null,
      },
    });
```

Replace with:

```ts
    const savedCoverLetter = await prisma.coverLetter.create({
      data: {
        jobDescription,
        coverLetterText: result.coverLetter,
        format,
        language: language || "en",
        userId: session.user.id,
        resumeId: result.resumeId || null,
        source: "ai_ui",
      },
    });
```

- [ ] **Step 6: Typecheck**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 7: Manual smoke test**

Generate one cover letter from the UI and confirm in `npx prisma studio` that its `CoverLetter.source` is `"ai_ui"`.

- [ ] **Step 8: Commit**

```bash
git add src/lib/agent/cover-letter-generation.ts src/app/api/agent/v1/cover-letters/route.ts src/app/api/agent/v1/cover-letters/generate/route.ts src/app/api/agent/mcp/route.ts src/app/api/account/generate-cover-letter/route.ts
git commit -m "$(cat <<'EOF'
feat(analytics): stamp CoverLetter.source (manual/ai_ui/agent) at every creation path

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `UserVisit` heartbeat (online / time-on-site)

**Files:**
- Create: `src/lib/visit-tracking.ts` (pure decision logic)
- Test: `src/__tests__/visit-tracking.test.ts`
- Create: `src/app/api/heartbeat/route.ts`
- Create: `src/components/layout/heartbeat-ping.tsx`
- Modify: `src/components/layout/app-shell.tsx` (mount the ping)

- [ ] **Step 1: Write the failing test for the visit-continuation rule**

Create `src/__tests__/visit-tracking.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { shouldContinueVisit, VISIT_GAP_MS } from "@/lib/visit-tracking";

describe("shouldContinueVisit", () => {
  it("continues the visit when the gap is under the threshold", () => {
    const lastSeenAt = new Date("2026-01-01T00:00:00Z");
    const now = new Date(lastSeenAt.getTime() + VISIT_GAP_MS - 1000);
    expect(shouldContinueVisit(lastSeenAt, now)).toBe(true);
  });

  it("starts a new visit when the gap is at or over the threshold", () => {
    const lastSeenAt = new Date("2026-01-01T00:00:00Z");
    const now = new Date(lastSeenAt.getTime() + VISIT_GAP_MS);
    expect(shouldContinueVisit(lastSeenAt, now)).toBe(false);
  });

  it("continues a visit at zero gap", () => {
    const lastSeenAt = new Date("2026-01-01T00:00:00Z");
    expect(shouldContinueVisit(lastSeenAt, lastSeenAt)).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run:
```bash
npx vitest run src/__tests__/visit-tracking.test.ts
```
Expected: FAIL — `Cannot find module '@/lib/visit-tracking'`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/lib/visit-tracking.ts`:

```ts
export const VISIT_GAP_MS = 5 * 60 * 1000;

export function shouldContinueVisit(lastSeenAt: Date, now: Date): boolean {
  return now.getTime() - lastSeenAt.getTime() < VISIT_GAP_MS;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run:
```bash
npx vitest run src/__tests__/visit-tracking.test.ts
```
Expected: PASS (3 tests).

- [ ] **Step 5: Build the heartbeat API route**

Create `src/app/api/heartbeat/route.ts`:

```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shouldContinueVisit } from "@/lib/visit-tracking";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();

  const lastVisit = await prisma.userVisit.findFirst({
    where: { userId },
    orderBy: { lastSeenAt: "desc" },
  });

  if (lastVisit && shouldContinueVisit(lastVisit.lastSeenAt, now)) {
    await prisma.userVisit.update({
      where: { id: lastVisit.id },
      data: { lastSeenAt: now },
    });
  } else {
    await prisma.userVisit.create({
      data: { userId, startedAt: now, lastSeenAt: now },
    });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Build the client heartbeat component**

Create `src/components/layout/heartbeat-ping.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";

const HEARTBEAT_INTERVAL_MS = 60 * 1000;

export function HeartbeatPing() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    const ping = () => {
      if (document.visibilityState === "visible") {
        fetch("/api/heartbeat", { method: "POST" }).catch(() => {});
      }
    };

    ping();
    const interval = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", ping);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", ping);
    };
  }, [session]);

  return null;
}
```

- [ ] **Step 7: Mount it in `AppShell`**

In `src/components/layout/app-shell.tsx`, add the import near the top (alongside the other component imports):

```tsx
import { HeartbeatPing } from "@/components/layout/heartbeat-ping";
```

Then find the root return:

```tsx
  return (
    <div className="min-h-screen bg-warm-50 text-warm-900 dark:bg-warm-950 dark:text-warm-50">
```

Replace with:

```tsx
  return (
    <div className="min-h-screen bg-warm-50 text-warm-900 dark:bg-warm-950 dark:text-warm-50">
      <HeartbeatPing />
```

- [ ] **Step 8: Typecheck and confirm `useSession` export exists**

Run:
```bash
grep -n 'export.*useSession' src/lib/auth-client.ts
npx tsc --noEmit
```
Expected: `useSession` is exported from `src/lib/auth-client.ts` (used elsewhere, e.g. `admin-sidebar.tsx`); no new type errors.

- [ ] **Step 9: Manual smoke test**

Sign in, load any dashboard page, wait a few seconds, then in `npx prisma studio` check `user_visit` has one row with `startedAt` ≈ `lastSeenAt` ≈ now for your user.

- [ ] **Step 10: Commit**

```bash
git add src/lib/visit-tracking.ts src/__tests__/visit-tracking.test.ts src/app/api/heartbeat/route.ts src/components/layout/heartbeat-ping.tsx src/components/layout/app-shell.tsx
git commit -m "$(cat <<'EOF'
feat(analytics): add heartbeat-based UserVisit tracking for online/time-on-site

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Log every agent request → `AgentRequestEvent`

**Files:**
- Modify: `src/lib/agent-auth.ts:43-78` (`authenticateAgentRequest`)

- [ ] **Step 1: Add the log call**

In `src/lib/agent-auth.ts`, find:

```ts
  // Throttle lastUsedAt writes — only update if stale by more than 5 minutes,
  // so a busy agent doesn't turn every request into a DB write.
  const STALE_MS = 5 * 60 * 1000;
  if (!record.lastUsedAt || Date.now() - record.lastUsedAt.getTime() > STALE_MS) {
    await prisma.agentToken.update({
      where: { id: record.id },
      data: { lastUsedAt: new Date() },
    });
  }

  return {
    userId: record.userId,
    tokenId: record.id,
    scopes: record.scopes.filter(isAgentScope),
  };
}
```

Replace with:

```ts
  // Throttle lastUsedAt writes — only update if stale by more than 5 minutes,
  // so a busy agent doesn't turn every request into a DB write.
  const STALE_MS = 5 * 60 * 1000;
  if (!record.lastUsedAt || Date.now() - record.lastUsedAt.getTime() > STALE_MS) {
    await prisma.agentToken.update({
      where: { id: record.id },
      data: { lastUsedAt: new Date() },
    });
  }

  const url = new URL(request.url);
  prisma.agentRequestEvent
    .create({
      data: {
        tokenId: record.id,
        userId: record.userId,
        transport: url.pathname.startsWith("/api/agent/mcp") ? "mcp" : "rest",
        route: url.pathname,
      },
    })
    .catch(() => {});

  return {
    userId: record.userId,
    tokenId: record.id,
    scopes: record.scopes.filter(isAgentScope),
  };
}
```

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

With a configured agent token, hit any `/api/agent/v1/*` route (e.g. `curl -H "Authorization: Bearer <token>" http://localhost:3000/api/agent/v1/profile`). Confirm a row appears in `agent_request_event` with `transport: "rest"` and the right `route`. Repeat via the MCP endpoint (any tool call) and confirm `transport: "mcp"`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/agent-auth.ts
git commit -m "$(cat <<'EOF'
feat(analytics): log every authenticated agent request to AgentRequestEvent

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Aggregation module — `getAnalyticsSummary`

**Files:**
- Create: `src/lib/admin/profile-completion.ts` (pure logic)
- Test: `src/__tests__/profile-completion.test.ts`
- Create: `src/lib/admin/analytics.ts` (Prisma aggregation)

- [ ] **Step 1: Write the failing test for profile-completion scoring**

Create `src/__tests__/profile-completion.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { isProfileComplete } from "@/lib/admin/profile-completion";

describe("isProfileComplete", () => {
  it("is false when profile is null", () => {
    expect(isProfileComplete(null)).toEqual({
      hasWorkExperience: false,
      hasEducation: false,
      hasSkills: false,
    });
  });

  it("is false for empty arrays", () => {
    expect(
      isProfileComplete({ workExperience: [], education: [], skills: [] }),
    ).toEqual({ hasWorkExperience: false, hasEducation: false, hasSkills: false });
  });

  it("is true when arrays are non-empty", () => {
    expect(
      isProfileComplete({
        workExperience: [{ title: "Engineer" }],
        education: [{ institution: "MIT" }],
        skills: [{ name: "TypeScript" }],
      }),
    ).toEqual({ hasWorkExperience: true, hasEducation: true, hasSkills: true });
  });

  it("treats non-array JSON as empty", () => {
    expect(
      isProfileComplete({ workExperience: "not-an-array", education: null, skills: undefined }),
    ).toEqual({ hasWorkExperience: false, hasEducation: false, hasSkills: false });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run:
```bash
npx vitest run src/__tests__/profile-completion.test.ts
```
Expected: FAIL — `Cannot find module '@/lib/admin/profile-completion'`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/lib/admin/profile-completion.ts`:

```ts
export interface ProfileCompletion {
  hasWorkExperience: boolean;
  hasEducation: boolean;
  hasSkills: boolean;
}

function isNonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

export function isProfileComplete(
  profile: { workExperience?: unknown; education?: unknown; skills?: unknown } | null,
): ProfileCompletion {
  return {
    hasWorkExperience: isNonEmptyArray(profile?.workExperience),
    hasEducation: isNonEmptyArray(profile?.education),
    hasSkills: isNonEmptyArray(profile?.skills),
  };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run:
```bash
npx vitest run src/__tests__/profile-completion.test.ts
```
Expected: PASS (4 tests).

- [ ] **Step 5: Write the aggregation module**

Create `src/lib/admin/analytics.ts`:

```ts
import { prisma } from "@/lib/prisma";
import { isProfileComplete } from "@/lib/admin/profile-completion";

export type AnalyticsRange = "7d" | "30d" | "90d";

const RANGE_DAYS: Record<AnalyticsRange, number> = { "7d": 7, "30d": 30, "90d": 90 };
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

function rangeStart(range: AnalyticsRange): Date {
  return new Date(Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000);
}

interface DailyCount {
  day: string;
  count: number;
}

async function dailyCounts(
  // Note the mixed casing: "Resume" has no @@map in schema.prisma (table name
  // defaults to the model name verbatim), the others do have @@map to snake_case.
  table: "Resume" | "cover_letter" | "user_visit" | "agent_request_event",
  since: Date,
  // UserVisit has no createdAt column — a visit is dated by when it started.
  dateColumn: "createdAt" | "startedAt" = "createdAt",
): Promise<DailyCount[]> {
  const rows = await prisma.$queryRawUnsafe<{ day: Date; count: bigint }[]>(
    `SELECT date_trunc('day', "${dateColumn}") AS day, COUNT(*) AS count
     FROM "${table}"
     WHERE "${dateColumn}" >= $1
     GROUP BY 1
     ORDER BY 1`,
    since,
  );
  return rows.map((r) => ({ day: r.day.toISOString().slice(0, 10), count: Number(r.count) }));
}

export async function getAnalyticsSummary(range: AnalyticsRange) {
  const since = rangeStart(range);
  const onlineSince = new Date(Date.now() - ONLINE_THRESHOLD_MS);

  const [
    totalUsers,
    profiles,
    totalResumes,
    resumesInRange,
    resumesBySource,
    resumeTrend,
    totalCoverLetters,
    coverLettersInRange,
    coverLettersBySource,
    coverLetterTrend,
    onlineNow,
    visitTrend,
    visitDurations,
    totalAgentTokens,
    activeAgentTokens,
    tokensUsedRecently,
    agentRequestTrend,
    agentTransportSplit,
    providerBreakdown,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.userProfile.findMany({
      select: { workExperience: true, education: true, skills: true },
    }),
    prisma.resume.count(),
    prisma.resume.count({ where: { createdAt: { gte: since } } }),
    prisma.resume.groupBy({ by: ["source"], _count: { _all: true } }),
    dailyCounts("Resume", since),
    prisma.coverLetter.count(),
    prisma.coverLetter.count({ where: { createdAt: { gte: since } } }),
    prisma.coverLetter.groupBy({ by: ["source"], _count: { _all: true } }),
    dailyCounts("cover_letter", since),
    prisma.userVisit.count({ where: { lastSeenAt: { gte: onlineSince } } }),
    dailyCounts("user_visit", since, "startedAt"),
    prisma.userVisit.findMany({
      where: { startedAt: { gte: since } },
      select: { startedAt: true, lastSeenAt: true },
    }),
    prisma.agentToken.count(),
    prisma.agentToken.count({ where: { revokedAt: null } }),
    prisma.agentToken.count({
      where: { revokedAt: null, lastUsedAt: { gte: since } },
    }),
    dailyCounts("agent_request_event", since),
    prisma.agentRequestEvent.groupBy({
      by: ["transport"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.aiUsageEvent.groupBy({
      by: ["provider"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
  ]);

  const profileCompletion = profiles.reduce(
    (acc, p) => {
      const c = isProfileComplete(p);
      if (c.hasWorkExperience) acc.hasWorkExperience++;
      if (c.hasEducation) acc.hasEducation++;
      if (c.hasSkills) acc.hasSkills++;
      return acc;
    },
    { hasWorkExperience: 0, hasEducation: 0, hasSkills: 0 },
  );

  const avgVisitDurationMs =
    visitDurations.length === 0
      ? 0
      : visitDurations.reduce(
          (sum, v) => sum + (v.lastSeenAt.getTime() - v.startedAt.getTime()),
          0,
        ) / visitDurations.length;

  return {
    range,
    profiles: {
      totalUsers,
      totalProfiles: profiles.length,
      ...profileCompletion,
    },
    resumes: {
      total: totalResumes,
      inRange: resumesInRange,
      bySource: resumesBySource.map((r) => ({ source: r.source, count: r._count._all })),
      trend: resumeTrend,
    },
    coverLetters: {
      total: totalCoverLetters,
      inRange: coverLettersInRange,
      bySource: coverLettersBySource.map((r) => ({ source: r.source, count: r._count._all })),
      trend: coverLetterTrend,
    },
    activity: {
      onlineNow,
      visitTrend,
      uniqueVisitDays: visitTrend.length,
      avgVisitDurationMs,
    },
    agentTokens: {
      total: totalAgentTokens,
      active: activeAgentTokens,
      usedInRange: tokensUsedRecently,
      requestTrend: agentRequestTrend,
      transportSplit: agentTransportSplit.map((t) => ({
        transport: t.transport,
        count: t._count._all,
      })),
    },
    providers: providerBreakdown.map((p) => ({ provider: p.provider, count: p._count._all })),
  };
}
```

- [ ] **Step 6: Typecheck**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors. If `groupBy`'s `_count` typing complains, confirm the generated Prisma client picked up the new `source` field (`npx prisma generate`).

- [ ] **Step 7: Commit**

```bash
git add src/lib/admin/profile-completion.ts src/__tests__/profile-completion.test.ts src/lib/admin/analytics.ts
git commit -m "$(cat <<'EOF'
feat(analytics): add getAnalyticsSummary aggregation module

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Admin analytics API route

**Files:**
- Create: `src/app/api/admin/analytics/route.ts`

- [ ] **Step 1: Write the route**

Create `src/app/api/admin/analytics/route.ts`:

```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary, type AnalyticsRange } from "@/lib/admin/analytics";

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as any)?.role?.toLowerCase();
  if (!session || !["superadmin", "admin"].includes(role || "")) {
    return null;
  }
  return { session, role: role! };
}

function parseRange(value: string | null): AnalyticsRange {
  return value === "7d" || value === "90d" ? value : "30d";
}

export async function GET(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const range = parseRange(request.nextUrl.searchParams.get("range"));

  try {
    const summary = await getAnalyticsSummary(range);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("ADMIN ANALYTICS GET ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

With the dev server running and signed in as an admin/superadmin, in a browser tab hit `http://localhost:3000/api/admin/analytics?range=30d` and confirm a JSON body with `profiles`, `resumes`, `coverLetters`, `activity`, `agentTokens`, `providers` keys comes back. Then check an unauthenticated request (e.g. `curl` with no cookie) gets `401`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/analytics/route.ts
git commit -m "$(cat <<'EOF'
feat(analytics): add GET /api/admin/analytics route

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: `/admin/dashboard` page and nav entry

**Files:**
- Create: `src/app/admin/dashboard/page.tsx`
- Modify: `src/components/layout/admin-sidebar.tsx` (add nav entry)
- (This task's client content component is built in Task 10 — this task wires the page shell and passes real data to a placeholder-free stub component that Task 10 fills in.)

- [ ] **Step 1: Add the "Dashboard" nav entry**

In `src/components/layout/admin-sidebar.tsx`, find the "Users" `<li>` block:

```tsx
          {isMounted && ["superadmin", "admin"].includes(userRole) && (
            <li>
              <LocalizedLink
                href="/admin/users"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group no-underline hover:no-underline ${
                  isActive("/admin/users")
                    ? "bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-500/20 dark:text-terracotta-400"
                    : "text-warm-600 hover:bg-warm-50 dark:text-warm-400 dark:hover:bg-warm-800/50"
                }`}
              >
                <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                Users
              </LocalizedLink>
            </li>
          )}
```

Replace with (adds a "Dashboard" entry right after it, same gating):

```tsx
          {isMounted && ["superadmin", "admin"].includes(userRole) && (
            <li>
              <LocalizedLink
                href="/admin/users"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group no-underline hover:no-underline ${
                  isActive("/admin/users")
                    ? "bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-500/20 dark:text-terracotta-400"
                    : "text-warm-600 hover:bg-warm-50 dark:text-warm-400 dark:hover:bg-warm-800/50"
                }`}
              >
                <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                Users
              </LocalizedLink>
            </li>
          )}
          {isMounted && ["superadmin", "admin"].includes(userRole) && (
            <li>
              <LocalizedLink
                href="/admin/dashboard"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group no-underline hover:no-underline ${
                  isActive("/admin/dashboard")
                    ? "bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-500/20 dark:text-terracotta-400"
                    : "text-warm-600 hover:bg-warm-50 dark:text-warm-400 dark:hover:bg-warm-800/50"
                }`}
              >
                <LayoutDashboard className="mr-3 h-5 w-5 flex-shrink-0" />
                Dashboard
              </LocalizedLink>
            </li>
          )}
```

No import change needed — `LayoutDashboard` is already imported in this file (`import { LayoutDashboard, FileText, Users, Briefcase } from "lucide-react";`) but currently unused.

- [ ] **Step 2: Create the page**

Create `src/app/admin/dashboard/page.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAnalyticsSummary } from "@/lib/admin/analytics";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const userRole = (session?.user as any)?.role?.toLowerCase();
  if (!session || !["superadmin", "admin"].includes(userRole)) {
    redirect("/");
  }

  const summary = await getAnalyticsSummary("30d");

  return (
    <div className="w-full py-2 sm:py-4">
      <h1 className="mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">
        Analytics Dashboard
      </h1>
      <AnalyticsDashboard initialSummary={summary} initialRange="30d" />
    </div>
  );
}
```

- [ ] **Step 3: Typecheck (expect one error — resolved in Task 10)**

Run:
```bash
npx tsc --noEmit
```
Expected: an error that `@/components/admin/analytics-dashboard` doesn't exist yet — that's fine, Task 10 creates it. Confirm no *other* errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/dashboard/page.tsx src/components/layout/admin-sidebar.tsx
git commit -m "$(cat <<'EOF'
feat(analytics): add /admin/dashboard page shell and sidebar nav entry

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Dashboard UI — stat tiles, range switch, and charts

**Files:**
- Create: `src/components/admin/analytics-dashboard.tsx` (client, orchestrates range switch + layout)
- Create: `src/components/admin/stat-tile.tsx`
- Create: `src/components/admin/trend-line-chart.tsx`
- Create: `src/components/admin/breakdown-bar-chart.tsx`

**Before writing any chart code in this task, invoke the `dataviz` skill** — it governs chart colors, accessibility, and layout for this project and must be loaded before the first line of SVG chart code is written.

- [ ] **Step 1: Invoke the dataviz skill**

Use the `Skill` tool with `dataviz` now, and follow its palette/mark-spec guidance for the two chart components below (adapt the exact colors/spacing it recommends; the structural code here is the contract to preserve).

- [ ] **Step 2: Build the stat tile**

Create `src/components/admin/stat-tile.tsx`:

```tsx
interface StatTileProps {
  label: string;
  value: string | number;
  sublabel?: string;
}

export function StatTile({ label, value, sublabel }: StatTileProps) {
  return (
    <div className="rounded-lg border border-warm-200 bg-white p-4 dark:border-warm-800 dark:bg-warm-900">
      <div className="text-xs font-medium uppercase tracking-wide text-warm-500 dark:text-warm-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-warm-900 dark:text-warm-50">
        {value}
      </div>
      {sublabel && (
        <div className="mt-1 text-xs text-warm-500 dark:text-warm-400">{sublabel}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build the trend line chart**

Create `src/components/admin/trend-line-chart.tsx`:

```tsx
interface TrendLineChartProps {
  title: string;
  data: { day: string; count: number }[];
  color?: string;
}

export function TrendLineChart({ title, data, color = "#c2410c" }: TrendLineChartProps) {
  const width = 600;
  const height = 160;
  const padding = 24;
  const max = Math.max(1, ...data.map((d) => d.count));

  const points = data.map((d, i) => {
    const x =
      data.length <= 1
        ? padding
        : padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.count / max) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <div className="rounded-lg border border-warm-200 bg-white p-4 dark:border-warm-800 dark:bg-warm-900">
      <div className="mb-2 text-sm font-medium text-warm-700 dark:text-warm-300">{title}</div>
      {data.length === 0 ? (
        <div className="py-8 text-center text-sm text-warm-400">No data in range</div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={title}>
          <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth={2} />
        </svg>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Build the breakdown bar chart**

Create `src/components/admin/breakdown-bar-chart.tsx`:

```tsx
interface BreakdownBarChartProps {
  title: string;
  data: { label: string; count: number }[];
  color?: string;
}

export function BreakdownBarChart({ title, data, color = "#c2410c" }: BreakdownBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="rounded-lg border border-warm-200 bg-white p-4 dark:border-warm-800 dark:bg-warm-900">
      <div className="mb-3 text-sm font-medium text-warm-700 dark:text-warm-300">{title}</div>
      {data.length === 0 ? (
        <div className="py-8 text-center text-sm text-warm-400">No data in range</div>
      ) : (
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <div className="w-24 shrink-0 truncate text-xs text-warm-500 dark:text-warm-400">
                {d.label}
              </div>
              <div className="h-4 flex-1 overflow-hidden rounded bg-warm-100 dark:bg-warm-800">
                <div
                  className="h-full rounded"
                  style={{ width: `${(d.count / max) * 100}%`, backgroundColor: color }}
                />
              </div>
              <div className="w-8 shrink-0 text-right text-xs text-warm-500 dark:text-warm-400">
                {d.count}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Build the orchestrating dashboard component**

Create `src/components/admin/analytics-dashboard.tsx`:

```tsx
"use client";

import { useState } from "react";
// Type-only import — erased at compile time, so this client component never
// bundles `@/lib/admin/analytics` (which imports the server-only Prisma
// client) into browser JS. Keep this a `import type`, never a value import.
import type { AnalyticsRange, getAnalyticsSummary } from "@/lib/admin/analytics";
import { StatTile } from "@/components/admin/stat-tile";
import { TrendLineChart } from "@/components/admin/trend-line-chart";
import { BreakdownBarChart } from "@/components/admin/breakdown-bar-chart";

type AnalyticsSummary = Awaited<ReturnType<typeof getAnalyticsSummary>>;

interface AnalyticsDashboardProps {
  initialSummary: AnalyticsSummary;
  initialRange: AnalyticsRange;
}

const RANGES: AnalyticsRange[] = ["7d", "30d", "90d"];

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function AnalyticsDashboard({ initialSummary, initialRange }: AnalyticsDashboardProps) {
  const [range, setRange] = useState<AnalyticsRange>(initialRange);
  const [summary, setSummary] = useState<AnalyticsSummary>(initialSummary);
  const [loading, setLoading] = useState(false);

  const handleRangeChange = async (next: AnalyticsRange) => {
    setRange(next);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${next}`);
      if (res.ok) {
        setSummary(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const profilePct = (n: number) =>
    summary.profiles.totalProfiles === 0
      ? "0%"
      : `${Math.round((n / summary.profiles.totalProfiles) * 100)}%`;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => handleRangeChange(r)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              range === r
                ? "bg-terracotta-600 text-white"
                : "bg-warm-100 text-warm-600 dark:bg-warm-800 dark:text-warm-400"
            }`}
          >
            {r}
          </button>
        ))}
        {loading && <span className="self-center text-xs text-warm-400">Loading…</span>}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Users" value={summary.profiles.totalUsers} />
        <StatTile
          label="Profiles filled"
          value={profilePct(summary.profiles.hasWorkExperience)}
          sublabel="have work experience"
        />
        <StatTile label="Resumes" value={summary.resumes.total} />
        <StatTile label="Cover letters" value={summary.coverLetters.total} />
        <StatTile label="Active agent tokens" value={summary.agentTokens.active} />
        <StatTile label="Online now" value={summary.activity.onlineNow} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrendLineChart title="Resumes created" data={summary.resumes.trend} />
        <TrendLineChart title="Cover letters created" data={summary.coverLetters.trend} />
        <TrendLineChart title="Site visits" data={summary.activity.visitTrend} />
        <TrendLineChart title="Agent requests" data={summary.agentTokens.requestTrend} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BreakdownBarChart
          title="Resumes by source"
          data={summary.resumes.bySource.map((s) => ({ label: s.source, count: s.count }))}
        />
        <BreakdownBarChart
          title="Cover letters by source"
          data={summary.coverLetters.bySource.map((s) => ({ label: s.source, count: s.count }))}
        />
        <BreakdownBarChart
          title="AI providers used"
          data={summary.providers.map((p) => ({ label: p.provider, count: p.count }))}
        />
        <BreakdownBarChart
          title="Agent connections by transport"
          data={summary.agentTokens.transportSplit.map((t) => ({
            label: t.transport,
            count: t.count,
          }))}
        />
      </div>

      <div className="text-xs text-warm-500 dark:text-warm-400">
        Avg visit duration: {formatDuration(summary.activity.avgVisitDurationMs)} · Agent tokens
        used in range: {summary.agentTokens.usedInRange}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Typecheck**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 7: Run the full test suite**

Run:
```bash
npx vitest run
```
Expected: all tests pass, including the new `visit-tracking.test.ts` and `profile-completion.test.ts`.

- [ ] **Step 8: Manual verification in the browser**

Sign in as an admin/superadmin, navigate to `/admin/dashboard`, confirm:
- Stat tiles render real numbers.
- The 7/30/90 range buttons re-fetch and update the charts.
- Line/bar charts render without console errors (check with `read_console_messages` if using the in-app browser tool, or the browser devtools directly).
- Non-admin users get redirected away from `/admin/dashboard`.

- [ ] **Step 9: Commit**

```bash
git add src/components/admin/analytics-dashboard.tsx src/components/admin/stat-tile.tsx src/components/admin/trend-line-chart.tsx src/components/admin/breakdown-bar-chart.tsx
git commit -m "$(cat <<'EOF'
feat(analytics): build admin dashboard UI (stat tiles, trend and breakdown charts)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Post-implementation check

- [ ] Full click-through of `/admin/dashboard` as both `admin` and `superadmin` roles, and confirm a plain `user` role gets redirected.
- [ ] Confirm `npx tsc --noEmit` and `npx vitest run` are both clean from repo root.
- [ ] Confirm `git status` shows nothing unintended staged (no stray debug files).
