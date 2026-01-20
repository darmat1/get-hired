import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "better-auth/crypto";

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

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Please fill in all fields" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Get user account with password
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id },
    });

    if (!account || !account.password) {
      return NextResponse.json(
        { error: "Account does not have a password set. Try signing in with a social provider." },
        { status: 400 }
      );
    }

    const isPasswordValid = await verifyPassword({
      hash: account.password,
      password: currentPassword,
    });

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Error changing password" },
      { status: 500 }
    );
  }
}
