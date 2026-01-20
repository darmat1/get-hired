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

    const { newEmail } = await request.json();

    if (!newEmail) {
      return NextResponse.json(
        { error: "Email not provided" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "This email is already in use" },
        { status: 409 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { email: newEmail },
    });

    return NextResponse.json({
      success: true,
      message: "Email updated successfully",
    });
  } catch (error) {
    console.error("Error updating email:", error);
    return NextResponse.json(
      { error: "Error updating email" },
      { status: 500 }
    );
  }
}
