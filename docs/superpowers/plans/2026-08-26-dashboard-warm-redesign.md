# Dashboard Warm Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish applying the warm/terracotta palette (from `docs/superpowers/plans/2026-08-25-warm-terracotta-redesign.md`) to the authenticated dashboard app. That plan rewrote the shared `--color-*` design tokens, which already fixed anything using semantic Tailwind utilities (`bg-primary`, `bg-card`, etc. — this is why `Button`/`Card`/`Badge` already look correct with zero edits). But most dashboard-specific layout and page files hardcode literal `slate-*`/`gray-*`/`white` Tailwind classes directly, so they never picked up the change — producing a visible clash between warm-themed shared components and still-slate-colored dashboard chrome.

**Architecture:** Same mechanical approach as the public-site plan: re-hue every literal `slate-N`/`gray-N`/`white` to the matching `warm-N` (the color scale already exists in `globals.scss`, added in the prior plan — nothing new to add to the theme). No new tokens, no structural changes, no new dependencies.

**Tech Stack:** Next.js 16, Tailwind v4 (`@theme` tokens already in place).

---

## The rules (identical to the public-site plan — copy verbatim into every task prompt)

**Rule 1 — plain re-hue.** Any `slate-N`/`gray-N`/`white` maps to the exact same-numbered `warm-N`: `slate-50→warm-50` ... `slate-950→warm-950`. Never shift the number.

**Rule 2 — primary actions get a terracotta touch.** The ONE most prominent action in a view (a primary submit/save button using `bg-slate-900`-style treatment, or — new for this plan — the ACTIVE item in a nav list) gets a terracotta accent instead of a plain re-hue. For an active sidebar nav item specifically: replace `bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50` with `bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-900/30 dark:text-terracotta-300` (a tinted terracotta pill, not the solid `bg-terracotta-500` button treatment — a nav item is a selection state, not a call-to-action button, so it should read as "highlighted," not as a button). Everything else in scope (secondary buttons, "Cancel" actions, plain nav items) stays Rule 1.

**Rule 4 — typography.** Add `font-heading` to page-level `<h1>` only (not every sub-heading in a form — dashboard is a working tool, not a marketing page; don't over-apply the display serif to dense UI). Do NOT add `font-body` anywhere in this plan's scope — dashboard should keep the default `font-sans` (Geist) body font it already has; `font-body` (Work Sans) is a marketing-page-only choice from the prior plan, not part of this one.

**Out of scope — do not touch:**
- `src/components/resume/previews/*` and `src/components/pdf-templates/*` — these render the user's own downloadable resume documents in a variety of deliberately distinct professional styles (Corporate, Creative, Minimal, etc.). They must NOT be re-themed to GetHired's brand colors — a user's resume should look like their chosen template, not like this app's marketing site.
- `src/components/ui/*` (Button, Card, Badge, Input, etc.) — already correct via the semantic tokens, don't add unnecessary edits.
- `src/app/admin/*` and anything admin-only — out of scope for this pass (small, internal, low-visibility surface; revisit later if needed).
- `src/components/resume/experience-editor.bak.tsx` — dead code (`.bak` extension, not imported anywhere), skip it.

---

## Task 1: Dashboard chrome — AppShell + Sidebar

**Files:**
- Modify: `src/components/layout/app-shell.tsx`
- Modify: `src/components/layout/sidebar.tsx`

This is the highest-impact fix — these two files are the actual source of the color clash the user saw (a screenshot of `/dashboard` showing hardcoded slate/navy panels next to the already-warm `Header`).

- [ ] Apply Rule 1 to every `slate-N`/`white` in both files: the outer page background, the desktop sidebar panel border/bg, the mobile header bar, the mobile slide-out drawer and its overlay, and every sidebar nav link's default/hover state.
- [ ] Apply Rule 2 to the active-nav-item highlight in `sidebar.tsx` (the `isActive(...)` ternary's true-branch classes, appearing 5 times for the 5 nav links) — terracotta tint per Rule 2's active-item recipe, not a plain re-hue.
- [ ] `npm run build 2>&1 | tail -30` — no errors.
- [ ] Commit: `git add src/components/layout/app-shell.tsx src/components/layout/sidebar.tsx && git commit -m "feat: apply warm redesign to dashboard app shell and sidebar"` — no Co-Authored-By trailer.

## Task 2: Small layout files

**Files:**
- Modify: `src/components/layout/admin-sidebar.tsx`
- Modify: `src/components/layout/ai-key-warning.tsx`
- Modify: `src/components/layout/cookie-consent.tsx`

- [ ] Apply Rule 1 throughout all three (read each first — they may or may not actually contain `slate-*`; if a file has none, say so and move on, don't invent changes).
- [ ] `npm run build 2>&1 | tail -30` — no errors.
- [ ] Commit: `git add src/components/layout/admin-sidebar.tsx src/components/layout/ai-key-warning.tsx src/components/layout/cookie-consent.tsx && git commit -m "feat: apply warm redesign to remaining layout components"` — no Co-Authored-By trailer.

## Task 3: Main dashboard page

**Files:**
- Modify: `src/app/dashboard/page.tsx`

This is the "Мой опыт" (My Experience) page the user's screenshot showed — the score badges, cards, tabs (Личные данные / Опыт работы / Образование / Навыки), and the "Загрузить PDF" / "Импорт" panel.

- [ ] Apply Rule 1 to all `slate-*`/`gray-*`/`white`. Apply Rule 2 to the page's primary action button(s) if any use the `bg-slate-900`-style solid-dark pattern (e.g. "Сохранить" / "Предложить резюме" if hardcoded rather than using the shared `Button` component — check first, since `Button` usages need no changes). Leave the score-badge colors (green/red success indicators) untouched — those are semantic status colors, not part of the neutral/brand scale. Apply Rule 4 to the page's one `<h1>`.
- [ ] `npm run build 2>&1 | tail -30` — no errors.
- [ ] Commit: `git add src/app/dashboard/page.tsx && git commit -m "feat: apply warm redesign to main dashboard (experience) page"` — no Co-Authored-By trailer.

## Task 4: Dashboard sub-pages

**Files:**
- Modify: `src/app/dashboard/cover-letter/page.tsx`
- Modify: `src/app/dashboard/jobs/page.tsx`
- Modify: `src/app/dashboard/jobs/[id]/page.tsx`
- Modify: `src/app/dashboard/my-cover-letters/page.tsx`
- Modify: `src/app/dashboard/my-resumes/page.tsx`

- [ ] Apply Rules 1/2/4 across all five, same approach as Task 3.
- [ ] `npm run build 2>&1 | tail -30` — no errors.
- [ ] Commit: `git add src/app/dashboard/cover-letter/page.tsx src/app/dashboard/jobs/page.tsx "src/app/dashboard/jobs/[id]/page.tsx" src/app/dashboard/my-cover-letters/page.tsx src/app/dashboard/my-resumes/page.tsx && git commit -m "feat: apply warm redesign to dashboard sub-pages"` — no Co-Authored-By trailer.

## Task 5: Profile pages + Profile settings layout

**Files:**
- Modify: `src/app/dashboard/profile/page.tsx`
- Modify: `src/app/dashboard/profile/layout.tsx`
- Modify: `src/app/dashboard/profile/ai/page.tsx`

- [ ] Apply Rules 1/2/4. These are likely thin wrapper files (1 symbol each per the file tree) — if a file turns out to have no color classes at all, say so, don't invent changes.
- [ ] `npm run build 2>&1 | tail -30` — no errors.
- [ ] Commit: `git add src/app/dashboard/profile/page.tsx src/app/dashboard/profile/layout.tsx src/app/dashboard/profile/ai/page.tsx && git commit -m "feat: apply warm redesign to profile settings pages"` — no Co-Authored-By trailer.

## Task 6: Profile form components

**Files:**
- Modify: `src/components/profile/ai-keys-form.tsx`
- Modify: `src/components/profile/ai-profile-interview.tsx`
- Modify: `src/components/profile/certificates-editor.tsx`
- Modify: `src/components/profile/education-editor.tsx`
- Modify: `src/components/profile/experience-editor.tsx`
- Modify: `src/components/profile/profile-assistant-widget.tsx`
- Modify: `src/components/profile/profile-form.tsx`
- Modify: `src/components/profile/resume-suggestions.tsx`

(Do NOT touch `experience-editor.bak.tsx` — dead code, unused.)

- [ ] Apply Rules 1/2/4 across all eight. These are form-heavy components (inputs, editable lists, modals) — Rule 2 applies to each form's primary submit/save action if hardcoded; most form field chrome (borders, labels, placeholder text) is Rule 1.
- [ ] `npm run build 2>&1 | tail -30` — no errors.
- [ ] Commit: `git add src/components/profile/ai-keys-form.tsx src/components/profile/ai-profile-interview.tsx src/components/profile/certificates-editor.tsx src/components/profile/education-editor.tsx src/components/profile/experience-editor.tsx src/components/profile/profile-assistant-widget.tsx src/components/profile/profile-form.tsx src/components/profile/resume-suggestions.tsx && git commit -m "feat: apply warm redesign to profile form components"` — no Co-Authored-By trailer.

## Task 7: Resume dashboard-UI components (NOT previews)

**Files:**
- Modify: `src/components/resume/ai-analysis-panel.tsx`
- Modify: `src/components/resume/company-score-button.tsx`
- Modify: `src/components/resume/education-form.tsx`
- Modify: `src/components/resume/job-match-modal.tsx`
- Modify: `src/components/resume/linkedin-import-button.tsx`
- Modify: `src/components/resume/personal-info-form.tsx`
- Modify: `src/components/resume/profile-import-modal.tsx`
- Modify: `src/components/resume/resume-preview.tsx`
- Modify: `src/components/resume/skills-form.tsx`
- Modify: `src/components/resume/template-selector.tsx`
- Modify: `src/components/resume/work-experience-form.tsx`

**Do NOT touch anything under `src/components/resume/previews/`** — those render the actual resume document content in the user's chosen template style and must keep their own distinct designs, not GetHired's brand palette. `resume-preview.tsx` itself is likely just a container/switcher (check first) — if it only picks which preview component to render and doesn't itself draw a template, recolor its own chrome (loading state, borders) but never touch what it renders.

- [ ] Apply Rules 1/2/4 across all eleven files (excluding the previews directory).
- [ ] `npm run build 2>&1 | tail -30` — no errors.
- [ ] Commit: `git add src/components/resume/ai-analysis-panel.tsx src/components/resume/company-score-button.tsx src/components/resume/education-form.tsx src/components/resume/job-match-modal.tsx src/components/resume/linkedin-import-button.tsx src/components/resume/personal-info-form.tsx src/components/resume/profile-import-modal.tsx src/components/resume/resume-preview.tsx src/components/resume/skills-form.tsx src/components/resume/template-selector.tsx src/components/resume/work-experience-form.tsx && git commit -m "feat: apply warm redesign to resume dashboard UI components"` — no Co-Authored-By trailer.

## Task 8: Full verification

- [ ] `npm run build 2>&1 | tail -80` — full clean build.
- [ ] `npm test 2>&1 | tail -20` — 75/75 still passing.
- [ ] `grep -rln "bg-slate-\|text-slate-\|border-slate-\|dark:bg-slate-\|dark:text-slate-\|dark:border-slate-" src/components/layout/app-shell.tsx src/components/layout/sidebar.tsx src/app/dashboard src/components/profile src/components/resume 2>/dev/null | grep -v previews | grep -v ".bak.tsx"` — should return nothing (or only files with a documented, deliberate reason to keep slate, e.g. a status-color usage that happens to say "slate" for something unrelated — inspect any hit before accepting it).
- [ ] Confirm `src/components/resume/previews/*`, `src/components/pdf-templates/*`, and `experience-editor.bak.tsx` were NOT touched: `git diff --stat <task-1-commit>~1..HEAD -- src/components/resume/previews src/components/pdf-templates src/components/profile/experience-editor.bak.tsx` should be empty.
- [ ] Ask the user to hard-refresh `/dashboard`, `/dashboard/my-resumes`, `/dashboard/profile` in their own browser (per their global instruction — don't open one yourself), in both light and dark mode, and confirm the sidebar/header/cards now read as one consistent warm palette instead of a mix.
