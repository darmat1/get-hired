import { auth } from "@/lib/auth";
import { isAvatarUrlExpired } from "@/lib/avatar-utils";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const linkedInAccount = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "linkedin",
      },
    });

    const hasLinkedIn = !!linkedInAccount;
    let avatarUrl: string | null = null;

    const currentInfo = (userProfile?.personalInfo as any) || {};
    const currentAvatarUrl = currentInfo.avatarUrl;

    if (linkedInAccount && linkedInAccount.accessToken) {
      const needsRefresh = isAvatarUrlExpired(currentAvatarUrl);

      if (needsRefresh) {
        try {
          const response = await fetch("https://api.linkedin.com/v2/userinfo", {
            headers: { Authorization: `Bearer ${linkedInAccount.accessToken}` },
          });

          if (response.ok) {
            const data = await response.json();
            const newAvatarUrl = data.picture;

            if (newAvatarUrl) {
              avatarUrl = newAvatarUrl;

              if (userProfile) {
                await prisma.userProfile.update({
                  where: { id: userProfile.id },
                  data: {
                    personalInfo: {
                      ...currentInfo,
                      avatarUrl: newAvatarUrl,
                    },
                  },
                });
              }
            }
          } else {
            avatarUrl = currentAvatarUrl;
          }
        } catch (e) {
          console.error("Failed to fetch LinkedIn avatar", e);
          avatarUrl = currentAvatarUrl;
        }
      } else {
        avatarUrl = currentAvatarUrl;
      }
    } else {
      avatarUrl = currentAvatarUrl;
    }

    return NextResponse.json({
      hasLinkedIn,
      avatarUrl,
      avatarExpired: avatarUrl ? isAvatarUrlExpired(avatarUrl) : true,
    });
  } catch (error) {
    console.error("Error checking LinkedIn status:", error);
    return NextResponse.json(
      { error: "Error checking LinkedIn status" },
      { status: 500 },
    );
  }
}
