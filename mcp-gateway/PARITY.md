# Agent Server Parity Map

Agent traffic is served by the Go service in `mcp-gateway/` (agents.gethired.work), human traffic by Next. Some logic exists in both on purpose. Any change to a file with a `// PARITY:` header must be mirrored in its twin in the same commit.

## Database Schema

DB schema is owned by Prisma. After a migration touching any of the following tables, update the Go SQL in `mcp-gateway/internal/`:
- `user`
- `agent_token`
- `agent_request_event`
- `ai_usage_event`
- `user_ai_key`
- `Resume`
- `cover_letter`
- `user_profile`

## Ported Symbols

| TypeScript (Next.js) | Go (mcp-gateway) | Notes |
|---|---|---|
| **Auth (`src/lib/agent-auth.ts`, `agent-scopes.ts`)** | **`internal/auth/auth.go`** | |
| `hashToken` | `HashToken` | |
| `authenticateAgentRequest` | `Authenticate` | |
| `hasScope` | `Has` | |
| | | |
| **Encryption (`src/lib/encryption.ts`)** | **`internal/ai/crypto.go`** | |
| `decrypt` | `Decrypt` | |
| Prisma extension read of `aiCredential.key` (`src/lib/prisma.ts`) | user-key block in `Client.Complete` (`internal/ai/complete.go`) | decrypt only if value contains `:`, keep raw on failure; empty key → server key |
| | | |
| **AI Providers (`src/lib/ai/server-ai.ts`, etc)** | **`internal/ai/complete.go`, etc** | |
| `aiComplete` | `Complete` | |
| `getFreeQuotaCount` | `FreeQuotaCount` | |
| `parseJsonResponse` | `ParseJSONResponse` | |
| `isModelCompatibleWithProvider` | (in `Complete` / providers) | |
| `mapModelForProvider` | (in providers) | |
| | | |
| **Prompts (`src/lib/ai/prompts/*.ts`)** | **`internal/prompts/*.go`** | |
| `getCoverLetterSystemPrompt` | `CoverLetterSystem` | |
| `buildCoverLetterUserPrompt` | `CoverLetterUser` | |
| `getTailoredResumeSystemPrompt` | `TailoredResumeSystem` | |
| `buildTailoredResumeUserPrompt` | `TailoredResumeUser` | |
| `buildSharedCareerContext` | `SharedCareerContext` | |
| `buildSelectionPrompt` | `Selection` | |
| `@toon-format/toon encode` | `EncodeTOON` | |
| | | |
| **Store (`src/app/api/agent/v1/...`)** | **`internal/store/*.go`** | |
| Profile data logic | `GetProfile`, `UpdateProfile` | |
| Resume data logic | `ListResumes`, `GetResume`, `CreateResume`, `UpdateResume`, `DeleteResume` | |
| Cover Letter data logic | `ListCoverLetters`, `GetCoverLetter`, `CreateCoverLetter`, `UpdateCoverLetter`, `DeleteCoverLetter` | |
| `TEMPLATES` | `Templates` | |
| | | |
| **Generation (`src/lib/agent/*-generation.ts`)** | **`internal/gen/*.go`** | |
| `generateResumeForUser` | `Resume` | |
| `generateCoverLetterForUser` | `CoverLetter` | |
| | | |
| **REST Handlers (`src/app/api/agent/v1/...`)** | **`internal/rest/*.go`** | |
| Route handlers | `RegisterHandlers` | |
| PDF proxy route | `internal/pdfproxy/pdfproxy.go` | |
| | | |
| **MCP Tools (`src/app/api/agent/mcp/route.ts`)** | **`internal/mcp/tools.go`** | |
| `buildServer` | Tool registration | |
| `textResult`, `errorResult`, `scopeError` | Helpers | |
