import { NextRequest, NextResponse } from "next/server";
import { authenticateAgentRequest, hasScope } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

const EMPTY_PROFILE = {
  personalInfo: {},
  workExperience: [],
  education: [],
  skills: [],
  certificates: [],
};

export async function GET(request: NextRequest) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "profile:read")) {
    return NextResponse.json(
      { error: "Missing required scope: profile:read" },
      { status: 403 },
    );
  }

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: ctx.userId },
    });

    if (!profile) {
      return NextResponse.json(EMPTY_PROFILE);
    }

    return NextResponse.json({
      personalInfo: profile.personalInfo || {},
      workExperience: profile.workExperience || [],
      education: profile.education || [],
      skills: profile.skills || [],
      certificates: profile.certificates || [],
    });
  } catch (error) {
    console.error("Error fetching agent profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "profile:write")) {
    return NextResponse.json(
      { error: "Missing required scope: profile:write" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();

    const existing = await prisma.userProfile.findUnique({
      where: { userId: ctx.userId },
    });

    const data = {
      personalInfo:
        body.personalInfo !== undefined
          ? body.personalInfo
          : existing?.personalInfo || {},
      workExperience:
        body.workExperience !== undefined
          ? body.workExperience
          : existing?.workExperience || [],
      education:
        body.education !== undefined ? body.education : existing?.education || [],
      skills: body.skills !== undefined ? body.skills : existing?.skills || [],
      certificates:
        body.certificates !== undefined
          ? body.certificates
          : existing?.certificates || [],
    };

    const profile = await prisma.userProfile.upsert({
      where: { userId: ctx.userId },
      create: { userId: ctx.userId, ...data },
      update: data,
    });

    return NextResponse.json({
      personalInfo: profile.personalInfo || {},
      workExperience: profile.workExperience || [],
      education: profile.education || [],
      skills: profile.skills || [],
      certificates: profile.certificates || [],
    });
  } catch (error) {
    console.error("Error updating agent profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
