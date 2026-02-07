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
    const resume = await prisma.resume.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Inject avatarUrl from UserProfile if missing in resume
    const personalInfo = (resume.personalInfo as any) || {};
    if (!personalInfo.avatarUrl) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      });

      let profileAvatar = (userProfile?.personalInfo as any)?.avatarUrl;

      // If missing in profile, try to fetch from LinkedIn directly
      if (!profileAvatar) {
        const linkedInAccount = await prisma.account.findFirst({
          where: { userId: session.user.id, providerId: "linkedin" },
        });

        if (linkedInAccount?.accessToken) {
          try {
            const response = await fetch(
              "https://api.linkedin.com/v2/userinfo",
              {
                headers: {
                  Authorization: `Bearer ${linkedInAccount.accessToken}`,
                },
              },
            );
            if (response.ok) {
              const data = await response.json();
              if (data.picture) {
                profileAvatar = data.picture;
                console.log("Fetched Avatar in Resume Editor:", profileAvatar);

                // Persist to Profile
                if (userProfile) {
                  await prisma.userProfile.update({
                    where: { id: userProfile.id },
                    data: {
                      personalInfo: {
                        ...((userProfile.personalInfo as any) || {}),
                        avatarUrl: profileAvatar,
                      },
                    },
                  });
                }
              }
            }
          } catch (e) {
            console.error("Error fetching LinkedIn avatar in editor:", e);
          }
        }
      }

      if (profileAvatar) {
        // Return resume with injected avatarUrl
        return NextResponse.json({
          ...resume,
          personalInfo: {
            ...personalInfo,
            avatarUrl: profileAvatar,
          },
        });
      }
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
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
    const body = await request.json();

    // Verify ownership
    const existingResume = await prisma.resume.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const updatedResume = await prisma.resume.update({
      where: {
        id: id,
      },
      data: {
        title: body.title || existingResume.title,
        template: body.template,
        personalInfo: body.personalInfo,
        workExperience: body.workExperience,
        education: body.education,
        skills: body.skills,
        certificates: body.certificates,
        customization: body.customization,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedResume);
  } catch (error) {
    console.error("Error updating resume:", error);
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

    // Verify ownership
    const existingResume = await prisma.resume.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    await prisma.resume.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
