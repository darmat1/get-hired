import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { FREE_QUOTA_LIMIT, getFreeQuotaCount } from "@/lib/ai/server-ai";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { aiKeys: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasOwnKey = user.aiKeys.length > 0;

    const count = getFreeQuotaCount(
      user.freeAiGenerationsCount,
      user.lastFreeAiUsage,
    );

    if (count === 0 && user.freeAiGenerationsCount !== 0) {
      // Background reset update
      await prisma.user.update({
        where: { id: userId },
        data: { freeAiGenerationsCount: 0 },
      });
    }

    return NextResponse.json({
      hasOwnKey,
      count,
      limit: FREE_QUOTA_LIMIT,
    });
  } catch (error) {
    console.error("[API] Error fetching AI quota:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
