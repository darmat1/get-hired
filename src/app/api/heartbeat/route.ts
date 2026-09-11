import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shouldContinueVisit } from "@/lib/visit-tracking";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();

  // ponytail: findFirst-then-create isn't atomic, so near-simultaneous heartbeats
  // from multiple open tabs can create two UserVisit rows for one real visit.
  // Acceptable for best-effort analytics; add a per-user advisory lock or
  // upsert-style guard if visit-count accuracy becomes load-bearing.
  const lastVisit = await prisma.userVisit.findFirst({
    where: { userId },
    orderBy: { lastSeenAt: "desc" },
  });

  try {
    if (lastVisit && shouldContinueVisit(lastVisit.lastSeenAt, now)) {
      await prisma.userVisit.update({
        where: { id: lastVisit.id },
        data: { lastSeenAt: now },
      });
    } else {
      await prisma.userVisit.create({
        data: { userId, startedAt: now, lastSeenAt: now },
      });
    }
  } catch (err) {
    console.error("[heartbeat] Failed to record visit:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
