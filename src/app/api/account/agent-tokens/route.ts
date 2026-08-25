import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  ALL_AGENT_SCOPES,
  generateAgentToken,
  isAgentScope,
} from "@/lib/agent-auth";

const MAX_TOKENS_PER_USER = 10;

/**
 * List the user's agent tokens. Never returns the raw token or its hash.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokens = await prisma.agentToken.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        tokenPrefix: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error("[agent-tokens GET]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Create a new agent token. The raw token is returned ONCE in this response
 * and never again — only its hash is persisted.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const scopes: string[] = Array.isArray(body.scopes) ? body.scopes : [];
    const expiresInDays =
      typeof body.expiresInDays === "number" ? body.expiresInDays : null;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const validScopes = scopes.filter(isAgentScope);
    if (validScopes.length === 0) {
      return NextResponse.json(
        { error: `At least one valid scope is required. Valid scopes: ${ALL_AGENT_SCOPES.join(", ")}` },
        { status: 400 },
      );
    }

    const activeCount = await prisma.agentToken.count({
      where: { userId: session.user.id, revokedAt: null },
    });
    if (activeCount >= MAX_TOKENS_PER_USER) {
      return NextResponse.json(
        { error: `You can have at most ${MAX_TOKENS_PER_USER} active agent tokens. Revoke one first.` },
        { status: 403 },
      );
    }

    const { token, tokenHash, tokenPrefix } = generateAgentToken();

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const record = await prisma.agentToken.create({
      data: {
        userId: session.user.id,
        name,
        tokenHash,
        tokenPrefix,
        scopes: validScopes,
        expiresAt,
      },
      select: {
        id: true,
        name: true,
        tokenPrefix: true,
        scopes: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ...record, token }, { status: 201 });
  } catch (error) {
    console.error("[agent-tokens POST]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
