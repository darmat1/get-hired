# Project Context

## Environment
- Language: TypeScript
- Runtime: Node.js with Next.js App Router
- Build: `npm run build`
- Test: No dedicated test script found; available verification commands are `npm run lint` and likely `npx tsc --noEmit`
- Package Manager: npm (package-lock.json present; bun.lock also present)

## Project Type
- [ ] Library/Package
- [x] Application (Web)
- [ ] Microservice
- [ ] Monorepo
- [ ] Other: Career/resume web app

## Infrastructure
- Container: None detected
- Orchestration: None detected
- CI/CD: No GitHub Actions workflow found
- Cloud: Vercel config present (`vercel.json`)

## Structure
- Source: `src/`
- Tests: No dedicated tests directory detected
- Docs: `README.md`
- Entry: `src/app/page.tsx`, root layout `src/app/layout.tsx`

## Conventions
- Naming: kebab-case files, PascalCase React components, camelCase functions/variables
- Imports: `@/*` alias to `src/*`
- Error handling: try/catch with `console.error` in async server/client flows
- State: Zustand stores in `src/stores/*`
- Data: Prisma schema in `prisma/schema.prisma`, generated client in `src/generated/client`
- i18n: custom translation provider with locale proxy/header/cookie flow
- Styling: SCSS + Tailwind utilities
- Auth: Better Auth with Prisma adapter and Next route handler

## Notes
- App domain is AI-assisted resume, cover letter, profile, and job application management.
- Major areas detected: landing/auth, dashboard/admin, resume builder, cover letters, AI provider integrations, Greenhouse integration.
- Root README is generic create-next-app boilerplate and does not describe actual project behavior.
- Repository contains ignored or auxiliary directories like `backups/`, `ideas/`, `chrome-extension/`, and a `.bak` component file.
- Existing `.opencode/todo.md` is only a starter placeholder and needs replacement with a real minimal mission plan.
