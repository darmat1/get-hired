# Warm Terracotta Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved "Warm Terracotta" visual direction (from the design canvas at https://claude.ai/code/artifact/9b63d1a2-6f40-4d2f-8ad0-ec19ba805191, Option A) to every public (non-authenticated) page.

**Architecture:** Rewrite the base `--color-*` design tokens in `src/app/globals.scss` `@theme` directly to the warm/terracotta palette (light values in place, and — since it's currently fully commented out — a real dark-mode override block with warm dark values), plus add `--color-warm-*`/`--color-terracotta-*` numeric scales (the semantic tokens don't have graduated steps, and most existing marketing components hardcode literal `slate-*` Tailwind classes rather than the semantic `bg-primary`/`text-foreground` utilities, so a real 50–950 ramp is still needed for file-level swaps) and `--font-heading`/`--font-body` (Lora + Work Sans) font variables, loaded additively in `src/app/layout.tsx` alongside the existing Geist fonts. Rewriting the base tokens means anything using them — including shared UI primitives (`Button`, `Card`, `Badge`) and by extension the authenticated app — picks up the new palette automatically; that's accepted for now (colors may shift there too), but **no file under `src/app/dashboard/`, `src/app/resume/`, `src/app/resume-builder/`, `src/app/admin/`, or `src/components/{resume,profile,pdf-templates}/` is edited by this plan** — only their colors may shift by inheriting the new tokens, their structure is untouched, and a dedicated dashboard redesign is a separate future project.

**Tech Stack:** Next.js 16, Tailwind v4 (`@theme` tokens), `next/font/google` (Lora, Work Sans).

## The color mapping (apply file by file)

Add this scale to `globals.scss` `@theme` (Task 1), then apply it everywhere else via find-and-replace judgment per the rules below.

```
--color-warm-50:  #FAF6F1
--color-warm-100: #F0E6DC
--color-warm-200: #E6D9CC
--color-warm-300: #D9C7B4
--color-warm-400: #C2A98D
--color-warm-500: #A8876A
--color-warm-600: #8A6A4E
--color-warm-700: #6B5039
--color-warm-800: #4A392E
--color-warm-900: #33271F
--color-warm-950: #221A15

--color-terracotta-50:  #FBEEE6
--color-terracotta-100: #F5D9C7
--color-terracotta-400: #D98552
--color-terracotta-500: #C1622D
--color-terracotta-600: #A34F22
--color-terracotta-700: #85401B
```

**Rule 1 — plain re-hue.** Any `slate-N` (or `gray-N`, or `white` used as a light-mode background/text) that is NOT a primary call-to-action button maps straight across: `slate-50→warm-50`, `slate-100→warm-100`, ... `slate-900→warm-900`, `dark:bg-gray-950→dark:bg-warm-950`, `bg-white→bg-warm-50`. This covers section backgrounds, borders, body text, muted text, card fills.

**Rule 2 — primary CTA buttons become terracotta.** A "primary CTA" is the most prominent clickable action on a section — typically the pattern `bg-slate-900 hover:bg-slate-800 text-white ... dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200` (dark pill in light mode, light pill in dark mode) or a shared `<Button>` used for the main action. Replace the ENTIRE background/hover/text color set for that one element with:
```
bg-terracotta-500 hover:bg-terracotta-600 text-white dark:bg-terracotta-500 dark:hover:bg-terracotta-600 dark:text-white
```
(Terracotta has enough contrast on both a warm-50 and a warm-950 background, so — unlike the old slate pattern — it does NOT need to flip between a dark and a light pill across themes; same colors both ways.) Secondary/outline buttons (the "Sign in with LinkedIn"-style bordered button next to a primary CTA) stay on Rule 1 (`border-warm-200`, `text-warm-700`, etc.) — only the single most prominent action per section becomes terracotta. Small accent touches — an active badge, a highlighted stat, a link hover color — may also use `terracotta-500`/`600` at your judgment, but don't tint everything; terracotta should read as an accent, not a second base color.

**Rule 3 — a shared `<Button>` used for a page's primary CTA.** `src/app/pricing/page.tsx` and `src/app/extension/page.tsx` use the shared `<Button>` component (`src/components/ui/button.tsx`) for their main CTA. Do NOT change `button.tsx` itself (Rule: never edit shared UI primitives). Instead, override the color via an explicit `className` on that specific `<Button>` usage, e.g. `className="rounded-full px-8 !bg-terracotta-500 hover:!bg-terracotta-600"` (the `!` important-modifier is needed here specifically because `Button`'s own variant classes would otherwise win the specificity fight — this is the one place in this plan where `!` is appropriate; don't reach for it elsewhere).

**Rule 4 — typography.** On every `<h1>`, `<h2>`, `<h3>` in scope, add the class `font-heading` (defined in Task 1 as `var(--font-lora)`) alongside whatever weight class is already there (`font-bold`, `font-extrabold`, etc. — keep the weight class, just add the family class). On each section's outermost wrapping element (the `<section>` or top-level `<div>`), add `font-body` (`var(--font-work-sans)`) once — it inherits down, so body text, labels, and buttons inside don't need it individually unless they sit outside that wrapper.

**If a spot doesn't clearly fit Rule 1 or Rule 2** (genuinely ambiguous — e.g. a color that's doing double duty), pick the reading that keeps the page's existing visual hierarchy (what was most prominent stays most prominent) and note it in your self-review rather than guessing silently.

---

## Task 1: Design system foundation

**Files:**
- Modify: `src/app/globals.scss`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1:** In `globals.scss`, inside the existing `@theme { ... }` block, add the 17 `--color-warm-*`/`--color-terracotta-*` custom properties from the mapping table above, plus:
```
--font-heading: var(--font-lora), Georgia, serif;
--font-body: var(--font-work-sans), system-ui, sans-serif;
```
Then rewrite the EXISTING semantic tokens in that same block to warm-palette values (light theme):
```
--color-primary: #C1622D;
--color-primary-foreground: #ffffff;
--color-primary-hover: #A34F22;

--color-background: #FAF6F1;
--color-foreground: #2B211B;

--color-card: #ffffff;
--color-card-foreground: #2B211B;

--color-popover: #ffffff;
--color-popover-foreground: #2B211B;

--color-secondary: #F0E6DC;
--color-secondary-foreground: #33271F;

--color-muted: #F0E6DC;
--color-muted-foreground: #8A6A4E;

--color-accent: #F5D9C7;
--color-accent-foreground: #85401B;

--color-border: #E6D9CC;
--color-input: #ffffff;
--color-input-border: #D9C7B4;
--color-ring: #C1622D;
```
(`--color-destructive`/`--color-success`/`--color-warning` stay as they are — those are semantic status colors, not part of the brand palette, and changing them isn't part of this redesign.)
- [ ] **Step 2:** `globals.scss` has a fully commented-out `.dark { ... }` override block right after `@theme` (search for `// @layer theme {` — it's dead code, never applied). Replace that entire commented block with a real, uncommented one:
```scss
@layer theme {
  .dark {
    --color-primary: #D98552;
    --color-primary-foreground: #221A15;
    --color-primary-hover: #E39A6D;
    --color-background: #221A15;
    --color-foreground: #F3E9E0;

    --color-card: #33271F;
    --color-card-foreground: #F3E9E0;
    --color-popover: #33271F;
    --color-popover-foreground: #F3E9E0;
    --color-secondary: #33271F;
    --color-secondary-foreground: #F0E6DC;
    --color-muted: #33271F;
    --color-muted-foreground: #C2A98D;
    --color-accent: #4A392E;
    --color-accent-foreground: #F5D9C7;

    --color-destructive: #f87171;
    --color-destructive-foreground: #1c0a0a;

    --color-border: #4A392E;
    --color-input: #33271F;
    --color-input-border: #6B5039;
    --color-ring: #D98552;
    --color-success: #4ade80;
    --color-success-foreground: #052e16;
    --color-warning: #fbbf24;
    --color-warning-foreground: #422006;

    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4);
  }
}
```
This is the first time this app's dark mode has driven these tokens (it's currently unused dead code) — after this change, anything reading `bg-primary`/`bg-background`/etc. will actually switch palette in dark mode for the first time via these tokens. Most existing code doesn't rely on them (it hardcodes `dark:bg-slate-900` etc. directly), so this is low-risk, but run the full build/verification steps below carefully and flag anything that looks double-themed.
- [ ] **Step 3:** In `layout.tsx`, alongside the existing `Geist`/`Geist_Mono` imports from `next/font/google`, add:
```ts
import { Lora, Work_Sans } from "next/font/google";

const lora = Lora({ variable: "--font-lora", subsets: ["latin"], weight: ["500", "600"] });
const workSans = Work_Sans({ variable: "--font-work-sans", subsets: ["latin"], weight: ["400", "500", "600"] });
```
Then add `${lora.variable} ${workSans.variable}` to the existing `className` string on `<body>` (alongside the existing `${geistSans.variable} ${geistMono.variable}` — don't remove those, just append).
- [ ] **Step 4:** Run `npm run build 2>&1 | tail -30` — confirm it still succeeds. Expect the dashboard/app UI to visually shift toward the warm palette wherever it uses the semantic tokens (`bg-primary`, `bg-background`, etc.) — that's expected per this plan's scope; anything hardcoding `slate-*` directly (most marketing components, and likely much of the dashboard) won't shift yet.
- [ ] **Step 5:** Commit: `git add src/app/globals.scss src/app/layout.tsx && git commit -m "feat: rewrite design tokens to warm/terracotta palette, add real dark mode, add Lora/Work Sans fonts"` — no Co-Authored-By trailer.

## Task 2: Header + Footer

**Files:**
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/layout/footer.tsx`

- [ ] **Step 1:** In `header.tsx`, `Header` is shared by both public and app routes, and per this plan's updated scope its colors are allowed to shift everywhere (only dashboard/app *files* stay unedited, not their inherited colors). Apply Rule 1 directly, unconditionally, to both `<header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80">` occurrences (skeleton + mounted branch) → `border-warm-200 bg-warm-50/80 dark:border-warm-800 dark:bg-warm-950/80`, and to the marketing nav link colors (`text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white` → `text-warm-700 hover:text-warm-900 dark:text-warm-300 dark:hover:text-warm-50`) and the logo text color. No conditional branching needed — this is a single unconditional recolor of the whole component.
- [ ] **Step 2:** In `footer.tsx` (renders only on public routes — safe to recolor fully), apply Rule 1 throughout: `border-border`→`border-warm-200 dark:border-warm-800`, `bg-background/50`→`bg-warm-50/50 dark:bg-warm-950/50`, `text-muted-foreground`→`text-warm-600 dark:text-warm-400`, `hover:text-foreground`→`hover:text-warm-900 dark:hover:text-warm-50`, heading text color → `text-warm-900 dark:text-warm-50`. Add `font-heading` to the `<h3>` column headings and `font-body` on the outer `<footer>` element.
- [ ] **Step 3:** `npm run build 2>&1 | tail -30` — no errors.
- [ ] **Step 4:** Commit: `git add src/components/layout/header.tsx src/components/layout/footer.tsx && git commit -m "feat: apply warm redesign to header (public routes) and footer"` — no Co-Authored-By trailer.

## Task 3: Homepage — Hero, Problem, Solution

**Files:**
- Modify: `src/components/landing/hero.tsx`
- Modify: `src/components/landing/problem.tsx`
- Modify: `src/components/landing/solution.tsx`

- [ ] **Step 1:** Read each file. Apply Rule 1 to all backgrounds/borders/body text. Apply Rule 2 to `hero.tsx`'s two hero CTAs (primary → terracotta per Rule 2; the LinkedIn secondary stays a Rule-1 outline button). Apply Rule 4 to every heading and each section's outer wrapper.
- [ ] **Step 2:** `npm run build 2>&1 | tail -30` — no errors.
- [ ] **Step 3:** Commit: `git add src/components/landing/hero.tsx src/components/landing/problem.tsx src/components/landing/solution.tsx && git commit -m "feat: apply warm redesign to homepage hero, problem, solution sections"` — no Co-Authored-By trailer.

## Task 4: Homepage — Features, HowItWorks, FAQ, AgentsTeaser

**Files:**
- Modify: `src/components/landing/features.tsx`
- Modify: `src/components/landing/how-it-works.tsx`
- Modify: `src/components/landing/faq-seo.tsx`
- Modify: `src/components/landing/agents-teaser.tsx`

- [ ] **Step 1:** Same treatment as Task 3 (Rules 1/2/4) across all four files. `agents-teaser.tsx`'s single CTA is its primary action → Rule 2 (terracotta). The "New" eyebrow badge (`bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900`) is a small accent, not the page's primary CTA — recolor it `bg-terracotta-500 text-white` in both themes (simpler, no light/dark flip needed, matches Rule 2's terracotta reasoning).
- [ ] **Step 2:** `npm run build 2>&1 | tail -30` — no errors.
- [ ] **Step 3:** Commit: `git add src/components/landing/features.tsx src/components/landing/how-it-works.tsx src/components/landing/faq-seo.tsx src/components/landing/agents-teaser.tsx && git commit -m "feat: apply warm redesign to homepage features, how-it-works, faq, agents teaser"` — no Co-Authored-By trailer.

## Task 5: Agents page — Hero, Capabilities, CompatibleWith

**Files:**
- Modify: `src/components/agents/agents-hero.tsx`
- Modify: `src/components/agents/agents-capabilities.tsx`
- Modify: `src/components/agents/agents-compatible-with.tsx`

- [ ] **Step 1:** Same Rules 1/2/4. `agents-hero.tsx`'s primary CTA (`/auth/signin`) → Rule 2; its `#how-it-works` secondary link stays Rule 1. `agents-compatible-with.tsx`'s three `Badge` usages: leave the `Badge` component import alone, just change the `className` overrides already passed to it (Rule 1 for the neutral two, or make "Claude"/"ChatGPT" pop with `bg-terracotta-50 dark:bg-terracotta-900/30 text-terracotta-700 dark:text-terracotta-300 border-terracotta-200 dark:border-terracotta-800` since they're the two named, most important badges — your call, keep it readable in both themes).
- [ ] **Step 2:** `npm run build 2>&1 | tail -30` — no errors.
- [ ] **Step 3:** Commit: `git add src/components/agents/agents-hero.tsx src/components/agents/agents-capabilities.tsx src/components/agents/agents-compatible-with.tsx && git commit -m "feat: apply warm redesign to agents page hero, capabilities, compatible-with"` — no Co-Authored-By trailer.

## Task 6: Agents page — HowItWorks, Security, FAQ, and the page's final CTA

**Files:**
- Modify: `src/components/agents/agents-how-it-works.tsx`
- Modify: `src/components/agents/agents-security.tsx`
- Modify: `src/components/agents/agents-faq.tsx`
- Modify: `src/app/agents/page.tsx`

- [ ] **Step 1:** Same Rules 1/4 across the three components (no new primary CTA in any of them — the numbered step badges and icon circles are Rule 1, not Rule 2). In `src/app/agents/page.tsx`, the final CTA section's `<LocalizedLink>` (currently the `bg-slate-900 ... dark:bg-slate-50 ...` pattern) is the page's second-most-prominent CTA after the hero's — apply Rule 2 (terracotta) to it too, and Rule 4 to its `<h2>`.
- [ ] **Step 2:** `npm run build 2>&1 | tail -30` — no errors, `/agents` route still present.
- [ ] **Step 3:** Commit: `git add src/components/agents/agents-how-it-works.tsx src/components/agents/agents-security.tsx src/components/agents/agents-faq.tsx src/app/agents/page.tsx && git commit -m "feat: apply warm redesign to agents page how-it-works, security, faq, final CTA"` — no Co-Authored-By trailer.

## Task 7: Pricing page

**Files:**
- Modify: `src/app/pricing/page.tsx`

- [ ] **Step 1:** Apply Rules 1/4 throughout. Apply Rule 3 to the Pro-tier `<Button>` (the actionable one — the free-tier CTA if it's also a `<Button>` can stay a Rule-1-colored outline/secondary look, only the single main upgrade action needs terracotta emphasis, and remember `pro_tag` is literally "Coming Soon" so don't make that button look more urgent/clickable than it should — a filled terracotta button is fine, just don't add motion/glow that oversells it).
- [ ] **Step 2:** `npm run build 2>&1 | tail -30` — no errors.
- [ ] **Step 3:** Commit: `git add src/app/pricing/page.tsx && git commit -m "feat: apply warm redesign to pricing page"` — no Co-Authored-By trailer.

## Task 8: Extension landing page

**Files:**
- Modify: `src/app/extension/page.tsx`

- [ ] **Step 1:** Apply Rules 1/4 throughout (including the `StepCard`, `ScreenshotPlaceholder`, `VideoPlaceholder` sub-components defined in this same file). Apply Rule 3 to the "Install Extension" `<Button>` — it's the page's one primary CTA.
- [ ] **Step 2:** `npm run build 2>&1 | tail -30` — no errors.
- [ ] **Step 3:** Commit: `git add src/app/extension/page.tsx && git commit -m "feat: apply warm redesign to extension landing page"` — no Co-Authored-By trailer.

## Task 9: AI info page

**Files:**
- Modify: `src/app/ai/page.tsx`
- Modify: `src/components/ai/ai-landing-client.tsx`

- [ ] **Step 1:** `src/app/ai/page.tsx` likely only carries `generateMetadata` + a thin wrapper — check it for any inline styling first (Rule 1/4 if present, otherwise it may need no changes at all). Apply Rules 1/2/4 to `ai-landing-client.tsx` (272 lines — read the whole file first to find its one or two primary CTAs before applying Rule 2 to them).
- [ ] **Step 2:** `npm run build 2>&1 | tail -30` — no errors.
- [ ] **Step 3:** Commit: `git add src/app/ai/page.tsx src/components/ai/ai-landing-client.tsx && git commit -m "feat: apply warm redesign to AI info page"` — no Co-Authored-By trailer.

## Task 10: Blog pages

**Files:**
- Modify: `src/app/blog/page.tsx`
- Modify: `src/app/blog/[slug]/page.tsx`
- Modify: `src/app/blog/page/[number]/page.tsx`

- [ ] **Step 1:** Apply Rules 1/4 to all three. Blog pages are mostly a card grid + article typography, not CTA-heavy — Rule 2 likely doesn't apply anywhere here (no primary action button expected), but check each file and apply it if one exists (e.g. a "Read more" that's styled as a solid button rather than a text link).
- [ ] **Step 2:** `npm run build 2>&1 | tail -30` — no errors.
- [ ] **Step 3:** Commit: `git add src/app/blog/page.tsx "src/app/blog/[slug]/page.tsx" "src/app/blog/page/[number]/page.tsx" && git commit -m "feat: apply warm redesign to blog pages"` — no Co-Authored-By trailer.

## Task 11: Legal pages

**Files:**
- Modify: `src/app/cookie-policy/page.tsx`
- Modify: `src/app/privacy-policy/page.tsx`
- Modify: `src/app/terms-of-service/page.tsx`

- [ ] **Step 1:** These are plain legal text pages — apply Rule 1 to the page wrapper/heading colors only (background, heading text, body text, any divider borders). No CTAs to worry about (Rule 2 doesn't apply). Apply Rule 4 to the page's single `<h1>`.
- [ ] **Step 2:** `npm run build 2>&1 | tail -30` — no errors.
- [ ] **Step 3:** Commit: `git add src/app/cookie-policy/page.tsx src/app/privacy-policy/page.tsx src/app/terms-of-service/page.tsx && git commit -m "feat: apply warm redesign to legal pages"` — no Co-Authored-By trailer.

## Task 12: Full verification

**Files:** none (verification only)

- [ ] **Step 1:** `npm run build 2>&1 | tail -80` — full clean build, every public route still present.
- [ ] **Step 2:** `npm test 2>&1 | tail -20` — 75/75 still passing (this redesign touches no logic under `src/lib`/`src/app/api`, so this should be unaffected; a failure here means something in scope accidentally touched shared code).
- [ ] **Step 3:** `grep -rln "bg-slate-900 hover:bg-slate-800" src/components/landing src/components/agents src/app/pricing src/app/extension src/app/ai src/app/blog src/app/cookie-policy src/app/privacy-policy src/app/terms-of-service src/app/agents 2>/dev/null` — should return nothing; any hit means a primary CTA in scope was missed by Rule 2.
- [ ] **Step 4:** Confirm no file was EDITED outside the scope list in this plan: `git diff --stat <first-task-commit>~1..HEAD` and check every path — no file under `src/app/dashboard/`, `src/app/resume/`, `src/app/resume-builder/`, `src/app/admin/`, `src/components/resume/`, `src/components/profile/`, `src/components/pdf-templates/`, or `src/components/ui/*` should appear in that diff (their colors may look different at runtime from inheriting the rewritten tokens — that's expected — but their source files aren't part of this plan).
- [ ] **Step 5:** Ask the user to check manually in their own browser (per their global instruction — don't open one yourself): `npm run dev`, then look at `/`, `/agents`, `/pricing`, `/extension`, `/ai`, `/blog`, and one legal page, in both light and dark mode, and at a phone-width viewport for at least the homepage and `/agents`.
