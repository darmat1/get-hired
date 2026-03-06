import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userRole = (session?.user as any)?.role?.toLowerCase();
    if (!session || !["superadmin", "admin"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Normalize roles to lowercase
    const normalizedUsers = users.map((u) => ({
      ...u,
      role: u.role?.toLowerCase() || "user",
    }));

    return NextResponse.json(normalizedUsers);
  } catch (error: any) {
    console.error("ADMIN USERS GET ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const currentAdminRole = (session?.user as any)?.role?.toLowerCase();
    if (!session || !["superadmin", "admin"].includes(currentAdminRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, role } = await request.json();
    const targetRole = role.toLowerCase();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "UserId and role are required" },
        { status: 400 },
      );
    }

    // Role management rules:
    // 1. Only Superadmin can manage Admin roles
    // 2. Admin can manage Publisher roles
    // 3. Admin cannot remove other Admins
    // 4. Admin cannot promote to Admin

    if (targetRole === "admin" && currentAdminRole !== "superadmin") {
      return NextResponse.json(
        { error: "Only Superadmin can assign Admin role" },
        { status: 403 },
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      targetUser?.role?.toLowerCase() === "admin" &&
      currentAdminRole !== "superadmin"
    ) {
      return NextResponse.json(
        { error: "Only Superadmin can modify Admin users" },
        { status: 403 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: targetRole },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("ADMIN USERS PATCH ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
