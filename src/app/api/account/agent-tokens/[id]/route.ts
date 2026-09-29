import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Revoke or permanently delete an agent token.
 * - Active tokens are revoked (revokedAt set to now) to preserve usage history/audit trail.
 * - Revoked or expired tokens are permanently deleted from the database (cascading request events).
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

    const now = new Date();
    const isActive =
      token.revokedAt === null &&
      (token.expiresAt === null || token.expiresAt > now);

    if (isActive) {
      await prisma.agentToken.update({
        where: { id },
        data: { revokedAt: now },
      });

      return NextResponse.json({ success: true, revoked: true });
    }

    await prisma.agentToken.delete({ where: { id } });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error("[agent-tokens DELETE]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
