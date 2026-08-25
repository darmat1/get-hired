import { NextRequest, NextResponse } from "next/server";
import { authenticateAgentRequest, hasScope } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "resumes:read")) {
    return NextResponse.json(
      { error: "Missing required scope: resumes:read" },
      { status: 403 },
    );
  }

  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: ctx.userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        template: true,
        targetPosition: true,
        targetCompany: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Error listing agent resumes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "resumes:write")) {
    return NextResponse.json(
      { error: "Missing required scope: resumes:write" },
      { status: 403 },
    );
  }

  try {
    const resumeCount = await prisma.resume.count({
      where: { userId: ctx.userId },
    });

    if (resumeCount >= 2) {
      return NextResponse.json(
        {
          error:
            "Resume limit reached. Please delete an existing resume to create a new one.",
          limitReached: true,
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    let personalInfo = body.personalInfo;
    let workExperience = body.workExperience;
    let education = body.education;
    let skills = body.skills;
    let certificates = body.certificates;

    const needsPrefill =
      !personalInfo && !workExperience && !education && !skills && !certificates;

    if (needsPrefill) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: ctx.userId },
      });

      if (profile) {
        personalInfo = profile.personalInfo || {};
        workExperience = profile.workExperience || [];
        education = profile.education || [];
        skills = profile.skills || [];
        certificates = profile.certificates || [];
      }
    }

    if (!personalInfo) personalInfo = {};

    const resume = await prisma.resume.create({
      data: {
        title:
          body.title ||
          ((personalInfo as any)?.firstName && (personalInfo as any)?.lastName
            ? `Resume ${(personalInfo as any).firstName} ${(personalInfo as any).lastName}`
            : "New Resume"),
        template: body.template || "professional",
        language: body.language || "en",
        personalInfo,
        workExperience: workExperience || [],
        education: education || [],
        skills: skills || [],
        certificates: certificates || [],
        customization: body.customization,
        targetPosition: body.targetPosition,
        targetCompany: body.targetCompany,
        userId: ctx.userId,
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error("Error creating agent resume:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
