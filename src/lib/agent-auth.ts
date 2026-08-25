import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { isAgentScope, type AgentScope } from "@/lib/agent-scopes";

export { ALL_AGENT_SCOPES, isAgentScope, type AgentScope } from "@/lib/agent-scopes";

export const AGENT_TOKEN_PREFIX = "agt_";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a new agent token. The raw token is returned once and never
 * stored — only its SHA-256 hash is persisted, mirroring how passwords
 * are handled (there's nothing to decrypt back, only to compare against).
 */
export function generateAgentToken(): {
  token: string;
  tokenHash: string;
  tokenPrefix: string;
} {
  const raw = crypto.randomBytes(32).toString("base64url");
  const token = `${AGENT_TOKEN_PREFIX}${raw}`;
  return {
    token,
    tokenHash: hashToken(token),
    tokenPrefix: token.slice(0, 12),
  };
}

export interface AgentAuthContext {
  userId: string;
  tokenId: string;
  scopes: AgentScope[];
}

/**
 * Validates the Authorization: Bearer <token> header against stored agent
 * tokens. Returns null for any failure (missing header, unknown token,
 * revoked, expired) — callers respond 401 without leaking which case it was.
 */
export async function authenticateAgentRequest(
  request: Request,
): Promise<AgentAuthContext | null> {
  const authHeader = request.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const rawToken = match[1].trim();
  if (!rawToken.startsWith(AGENT_TOKEN_PREFIX)) return null;

  const tokenHash = hashToken(rawToken);

  const record = await prisma.agentToken.findUnique({
    where: { tokenHash },
  });

  if (!record) return null;
  if (record.revokedAt) return null;
  if (record.expiresAt && record.expiresAt < new Date()) return null;

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

export function hasScope(
  ctx: AgentAuthContext,
  required: AgentScope,
): boolean {
  return ctx.scopes.includes(required);
}
