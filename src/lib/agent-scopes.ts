// Client-safe: no server-only imports (no prisma, no node:crypto). Anything
// a client component needs (scope list/type/validator for the token-creation
// UI) lives here, separate from agent-auth.ts which pulls in Prisma and is
// server-only. Importing ALL_AGENT_SCOPES from agent-auth.ts in a client
// component drags Prisma into the browser bundle and crashes at runtime.

export const ALL_AGENT_SCOPES = [
  "profile:read",
  "profile:write",
  "resumes:read",
  "resumes:write",
  "cover_letters:read",
  "cover_letters:write",
  "ai:generate",
] as const;

export type AgentScope = (typeof ALL_AGENT_SCOPES)[number];

export function isAgentScope(value: string): value is AgentScope {
  return (ALL_AGENT_SCOPES as readonly string[]).includes(value);
}
