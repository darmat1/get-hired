import { auth } from "@/lib/auth";
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

    // 1. Get User Profile to check/update
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    // 2. Check LinkedIn Account
    const linkedInAccount = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "linkedin",
      },
    });

    let avatarUrl: string | null = null;
    const hasLinkedIn = !!linkedInAccount;

    // 3. If linked, try to fetch/sync avatar
    if (linkedInAccount && linkedInAccount.accessToken) {
      // Check if profile already has avatar
      const currentInfo = (profile?.personalInfo as any) || {};

      if (!currentInfo.avatarUrl) {
        // Fetch from LinkedIn
        try {
          const response = await fetch("https://api.linkedin.com/v2/userinfo", {
            headers: { Authorization: `Bearer ${linkedInAccount.accessToken}` },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.picture) {
              avatarUrl = data.picture;

              console.log("Avatar URL:", avatarUrl);

              // Persist to Profile if profile exists
              if (profile) {
                await prisma.userProfile.update({
                  where: { id: profile.id },
                  data: {
                    personalInfo: {
                      ...currentInfo,
                      avatarUrl, // Add avatarUrl
                    },
                  },
                });
                // Update local variable to return it
                currentInfo.avatarUrl = avatarUrl;
              }
            }
          }
        } catch (e) {
          console.error("Failed to fetch LinkedIn avatar", e);
        }
      } else {
        avatarUrl = currentInfo.avatarUrl;
      }
    }

    return NextResponse.json({
      hasLinkedIn,
      avatarUrl,
    });
  } catch (error) {
    console.error("Error checking LinkedIn status:", error);
    return NextResponse.json(
      { error: "Error checking LinkedIn status" },
      { status: 500 },
    );
  }
}
