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

  const lastVisit = await prisma.userVisit.findFirst({
    where: { userId },
    orderBy: { lastSeenAt: "desc" },
  });

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

  return NextResponse.json({ ok: true });
}
