import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAvatarUrlExpired(url: string | null | undefined): boolean {
  if (!url) return true;
  
  try {
    const urlObj = new URL(url);
    const expiresParam = urlObj.searchParams.get("e");
    
    if (!expiresParam) {
      return true;
    }
    
    const expiresAt = parseInt(expiresParam, 10);
    if (isNaN(expiresAt)) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return now > expiresAt;
  } catch {
    return true;
  }
}

async function getFreshLinkedInAvatar(userId: string): Promise<string | null> {
  const linkedInAccount = await prisma.account.findFirst({
    where: { userId, providerId: "linkedin" },
  });

  if (!linkedInAccount?.accessToken) {
    return null;
  }

  try {
    const response = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${linkedInAccount.accessToken}` },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.picture || null;
  } catch {
    return null;
  }
}

async function updateProfileAvatar(userId: string, avatarUrl: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!profile) return;

  const currentInfo = (profile.personalInfo as any) || {};
  
  await prisma.userProfile.update({
    where: { id: profile.id },
    data: {
      personalInfo: {
        ...currentInfo,
        avatarUrl,
      },
    },
  });
}

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

    let personalInfo = (resume.personalInfo as any) || {};
    let avatarUrl = personalInfo.avatarUrl;

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    let profileAvatar = (userProfile?.personalInfo as any)?.avatarUrl;

    if (!profileAvatar || isAvatarUrlExpired(profileAvatar)) {
      const freshAvatar = await getFreshLinkedInAvatar(session.user.id);
      if (freshAvatar) {
        profileAvatar = freshAvatar;
        await updateProfileAvatar(session.user.id, freshAvatar);
      }
    }

    if (!avatarUrl) {
      avatarUrl = profileAvatar;
    } else if (isAvatarUrlExpired(avatarUrl) && profileAvatar) {
      avatarUrl = profileAvatar;
    }

    if (!avatarUrl && profileAvatar) {
      avatarUrl = profileAvatar;
    }

    const finalResume = {
      ...resume,
      personalInfo: {
        ...personalInfo,
        avatarUrl,
      },
    };

    return NextResponse.json(finalResume);
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
        language: body.language,
        targetPosition: body.targetPosition,
        targetCompany: body.targetCompany,
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
