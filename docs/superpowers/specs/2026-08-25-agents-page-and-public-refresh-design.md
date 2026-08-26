# AI Agents (MCP) page + public site refresh — design

## Context

GetHired already ships a working MCP integration for AI agents:

- `src/app/api/agent/mcp/route.ts` — MCP server (`@modelcontextprotocol/sdk`) exposing tools scoped by `AgentScope`.
- `src/app/api/agent/v1/**` — REST equivalents (profile, resumes, cover-letters, templates).
- `src/lib/agent-auth.ts` / `src/lib/agent-scopes.ts` — token auth (`agt_` prefix, hashed, scoped: `profile:read/write`, `resumes:read/write`, `cover_letters:read/write`, `ai:generate`).
- `src/components/settings/agent-tokens-section.tsx` — token management UI (create/revoke/expire), already renders an MCP JSON snippet and a curl snippet once a token is issued.

None of this is discoverable from the public site. There is no page explaining it, no link in nav, no mention on the homepage. Separately, the public (non-authenticated) pages have gone stale — the header carries zero marketing nav, and the copy in `src/lib/translations-data.ts` hasn't had a critical pass.

This spec covers both, as one project in two implementation phases.

## Scope

**Public pages in scope:** `/`, `/pricing`, `/templates`, `/ai`, `/extension`, `/blog` (+ `[slug]`, `/blog/page/[number]`), `/privacy-policy`, `/terms-of-service`, `/cookie-policy`, plus the new `/agents`.

**Out of scope:** `/auth/*` (functional forms, not marketing surfaces), everything under `/dashboard`, `/resume`, `/resume-builder`, `/cover-letter` app shell (authenticated app, uses `AppShell`/`isAppRoute`, not the marketing `Header`/`Footer`), `/admin/*`.

**Design system:** no new palette, no new component library. Stay inside the existing Tailwind v4 `@theme` tokens in `src/app/globals.scss` (slate-based `--color-primary` etc.) and existing `src/components/ui/*` primitives (`Card`, `Badge`, `Button`). This is a refresh, not a rebrand — tighten spacing/typography/copy, add the missing nav, and add one new page.

## Phase A — `/agents` page + discoverability

### Route & composition

- `src/app/agents/page.tsx` — server component, `generateMetadata` following the pattern in `src/app/pricing/page.tsx` / `src/app/page.tsx`.
- `src/components/agents/agents-landing-page.tsx` — client composition, mirrors `src/components/landing/landing-page.tsx`'s pattern of stitching section components together.
- Section components under `src/components/agents/`: `agents-hero.tsx`, `agents-capabilities.tsx` (the "what you can do" cards), `agents-compatible-with.tsx` (Claude/ChatGPT/other MCP clients badge row), `agents-how-it-works.tsx` (3-step, reuses the real MCP JSON snippet shape from `agent-tokens-section.tsx` but with a redacted illustrative token), `agents-security.tsx`, `agents-faq.tsx` (reuse the `FAQSEO` accordion pattern), final CTA block (can live at the bottom of the hero or security section — no need for a dedicated component if it's short).

### Content direction

Audience is broad, not developer-only — practically everyone uses an AI agent now (Claude, ChatGPT, and other MCP-capable tools), so lead with the outcome, not the protocol:

- Hero headline: benefit-first ("Let your AI assistant handle your resume — no copy-paste"), not "MCP integration for developers."
- Name Claude and ChatGPT explicitly as compatible clients; cover the rest with "and any other MCP-compatible AI assistant" — no fabricated logos or partnership claims.
- Capabilities section maps 1:1 to real scopes: update profile (`profile:*`), tailor/generate resumes (`resumes:*`), write cover letters (`cover_letters:*`), score/analyze (`ai:generate`). Don't invent capabilities the API doesn't have.
- "How it works": create a token in Settings → paste the one JSON snippet into your AI tool's MCP config → ask it to do something. Match the real snippet format from `buildMcpSnippet()` in `agent-tokens-section.tsx` (`mcpServers.get-hired.url` + `Authorization: Bearer` header) so the page and the product never disagree.
- Security section: scoped permissions, token stored as a hash server-side (`hashToken` in `agent-auth.ts`), revoke anytime from Settings.
- Status: presented as available now — no "beta" badge, no waitlist language.
- CTA targets: primary CTA goes to `/auth/signin` (unauthenticated) — once signed in, the natural next step is Settings → Agent Tokens; don't try to deep-link into a specific settings tab if one doesn't already exist as a URL fragment.

### Discoverability

- `src/components/layout/header.tsx`: currently renders no marketing nav at all (only logo, theme toggle, language selector, sign-in/user menu) for non-app routes. Add a simple nav row (Pricing, Templates, Blog, AI Agents) visible when `!isApplicationPage`, following the existing mobile-safe patterns already in the codebase (check for an existing mobile menu pattern before inventing one — if there isn't one, a simple flex-wrap nav is enough; don't build a hamburger drawer for four links unless the viewport genuinely requires it).
- `src/components/layout/footer.tsx`: add an "AI Agents" `<li>` in the "Product" column (`footer.product`), alongside the existing AI Analysis / Pricing / Blog links.
- Homepage (`src/components/landing/landing-page.tsx`): insert one compact new section between `<Features />` and `<HowItWorks />` — an "eyebrow + headline + one line + CTA" banner (not a full section rebuild), linking to `/agents`. New component: `src/components/landing/agents-teaser.tsx`.
- `src/app/sitemap.ts`: add the `/agents` route alongside the other static routes.

### i18n

All copy goes through `src/lib/translations-data.ts` (flat `"key": { en, uk, ru }` map). New keys namespaced `agents.*` (e.g. `agents.hero.title`, `agents.capabilities.resumes.title`). Write en copy first, then uk/ru in matching tone — flag in the handoff that machine-translated uk/ru should get a native read before shipping.

## Phase B — copywriting pass on existing public pages

Read the current en copy for each in-scope page/section (Hero, Problem, Solution, Features, HowItWorks, FAQSEO, Pricing, Templates, Extension landing) directly from `translations-data.ts`. For each block, check against:

- **Specificity** — concrete claims/numbers over vague adjectives.
- **Benefit-first** — leads with the outcome for the user, not the feature name.
- **Active voice / strong verbs** — cut hedging ("helps you to potentially...").
- **CTA clarity** — one clear action, no competing verbs.
- **Redundancy** — cut repeated claims across sections (e.g. don't re-pitch the same point in Problem and Solution).

Rewrite the blocks that fail 2+ criteria, in place, keeping existing translation keys stable unless a key is actually being removed. Update uk/ru to match. Don't touch blocks that already pass — this is a targeted edit, not a full rewrite.

Visual polish alongside the copy pass: align section padding/max-width conventions across `/pricing`, `/templates`, `/ai`, `/extension`, `/blog` to whatever pattern the refreshed homepage/`/agents` settle on (mostly a matter of consistent `max-w-7xl px-4 sm:px-6 lg:px-8` wrapping and heading scale — these already exist in most files, so this is normalization, not new design).

## Verification

- `npm run build` / `next lint` for the new route and edited files.
- Manual check in the dev server: `/agents` in light + dark mode, homepage with the new teaser section, header nav on a narrow viewport, footer link, and a spot check of two or three pages touched in Phase B.
- No automated visual regression tooling in this repo — verification is manual browser check, not a new test suite.
