import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const isE2E = process.env.E2E === "1";

export async function DELETE(request: NextRequest) {
  if (!isE2E) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const emails = (
    Array.isArray(body?.emails) ? body.emails : []
  ) as string[];

  if (emails.length === 0) {
    return NextResponse.json(
      { error: "No emails provided" },
      { status: 400 },
    );
  }

  const result = await prisma.user.deleteMany({
    where: {
      email: { in: emails, startsWith: "e2e-" },
      isTestUser: true,
    },
  });

  return NextResponse.json({ deletedCount: result.count });
}