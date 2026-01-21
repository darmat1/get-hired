import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has LinkedIn account connected
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "linkedin",
      },
    });

    return NextResponse.json({
      hasLinkedIn: !!account,
      accessToken: account?.accessToken || null,
    });
  } catch (error) {
    console.error("Error checking LinkedIn status:", error);
    return NextResponse.json(
      { error: "Error checking LinkedIn status" },
      { status: 500 }
    );
  }
}
