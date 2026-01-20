import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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

    const { newName } = await request.json();

    if (!newName) {
      return NextResponse.json(
        { error: "Name not provided" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: newName },
    });

    return NextResponse.json({
      success: true,
      message: "Name updated successfully",
    });
  } catch (error) {
    console.error("Error updating name:", error);
    return NextResponse.json(
      { error: "Error updating name" },
      { status: 500 }
    );
  }
}
