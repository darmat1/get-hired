import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const role = (session?.user as any)?.role?.toLowerCase();
  if (!session || !["superadmin", "admin"].includes(role || "")) {
    return null;
  }
  return { session, role: role! };
}

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [users, expiredVerificationCount] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.verification.count({
        where: {
          expiresAt: { lt: new Date() },
        },
      }),
    ]);

    // Normalize roles to lowercase
    const normalizedUsers = users.map((u) => ({
      ...u,
      role: u.role?.toLowerCase() || "user",
    }));

    return NextResponse.json({
      users: normalizedUsers,
      expiredVerificationCount,
    });
  } catch (error: any) {
    console.error("ADMIN USERS GET ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, role, emailVerified } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "UserId is required" },
        { status: 400 },
      );
    }

    const data: any = {};
    if (role !== undefined) {
      const targetRole = role.toLowerCase();
      
      // Role management rules:
      if (targetRole === "admin" && admin.role !== "superadmin") {
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
        admin.role !== "superadmin"
      ) {
        return NextResponse.json(
          { error: "Only Superadmin can modify Admin users" },
          { status: 403 },
        );
      }
      data.role = targetRole;
    }

    if (emailVerified !== undefined) {
      data.emailVerified = emailVerified;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("ADMIN USERS PATCH ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Mass cleanup actions
    if (body.action === "cleanup-bots") {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const deletedUsers = await prisma.user.deleteMany({
        where: {
          emailVerified: false,
          createdAt: { lt: cutoff },
        },
      });
      return NextResponse.json({ deletedCount: deletedUsers.count });
    }

    if (body.action === "cleanup-tokens") {
      const deletedVerifications = await prisma.verification.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
      return NextResponse.json({ deletedCount: deletedVerifications.count });
    }

    // Single user delete
    if (body.userId) {
      // Prevent deleting yourself
      if (body.userId === admin.session.user.id) {
        return NextResponse.json(
          { error: "Cannot delete your own account" },
          { status: 400 },
        );
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: body.userId },
        select: { role: true },
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 },
        );
      }

      // Admins can't delete other admins/superadmins
      const targetRole = targetUser.role?.toLowerCase() || "user";
      if (
        ["admin", "superadmin"].includes(targetRole) &&
        admin.role !== "superadmin"
      ) {
        return NextResponse.json(
          { error: "Only Superadmin can delete Admin users" },
          { status: 403 },
        );
      }

      await prisma.user.delete({ where: { id: body.userId } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "userId or action is required" },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("ADMIN USERS DELETE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
