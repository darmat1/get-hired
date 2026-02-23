import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const resume = await (prisma.resume.create as any)({
      data: {
        title:
          body.title ||
          (body.personalInfo?.firstName && body.personalInfo?.lastName
            ? `Resume ${body.personalInfo.firstName} ${body.personalInfo.lastName}`
            : "New Resume"),
        template: body.template || "modern",
        language: body.language || "en",
        personalInfo: body.personalInfo || {},
        workExperience: body.workExperience || [],
        education: body.education || [],
        skills: body.skills || [],
        certificates: body.certificates || [],
        userId: session.user.id,
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
