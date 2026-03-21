import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const coverLetter = await prisma.coverLetter.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!coverLetter) {
      return NextResponse.json(
        { error: "Cover letter not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(coverLetter);
  } catch (error) {
    console.error("Error fetching cover letter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const coverLetter = await prisma.coverLetter.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!coverLetter) {
      return NextResponse.json(
        { error: "Cover letter not found" },
        { status: 404 },
      );
    }

    await prisma.coverLetter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cover letter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
