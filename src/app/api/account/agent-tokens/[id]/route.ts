import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Revoke an agent token. Soft-delete via revokedAt so usage history/audit
 * trail (lastUsedAt, createdAt) is preserved.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const token = await prisma.agentToken.findUnique({ where: { id } });
    if (!token || token.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.agentToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[agent-tokens DELETE]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
