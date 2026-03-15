import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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
    
    // Check if we need to reset the daily quota
    let count = user.freeAiGenerationsCount;
    if (user.lastFreeAiUsage) {
      const lastUsageDate = new Date(user.lastFreeAiUsage);
      const today = new Date();
      
      // Reset if the last usage was not today (UTC)
      if (
        lastUsageDate.getUTCFullYear() !== today.getUTCFullYear() ||
        lastUsageDate.getUTCMonth() !== today.getUTCMonth() ||
        lastUsageDate.getUTCDate() !== today.getUTCDate()
      ) {
        count = 0;
        
        // Background reset update
        await prisma.user.update({
          where: { id: userId },
          data: { freeAiGenerationsCount: 0 }
        });
      }
    }

    return NextResponse.json({
      hasOwnKey,
      count,
      limit: 10
    });
  } catch (error) {
    console.error("[API] Error fetching AI quota:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
