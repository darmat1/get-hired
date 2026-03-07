import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: "4mb",
//     },
//   },
// };

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

    const resumeCount = await prisma.resume.count({
      where: { userId: session.user.id },
    });

    if (resumeCount >= 2) {
      return NextResponse.json(
        {
          error:
            "Resume limit reached. Please delete an existing resume to create a new one.",
        },
        { status: 403 },
      );
    }

    const body = await req.json();

    // If body is mostly empty (like in "New Resume" page), fetch data from profile
    let personalInfo = body.personalInfo;
    let workExperience = body.workExperience;
    let education = body.education;
    let skills = body.skills;
    let certificates = body.certificates;

    // Check if we need to pre-fill from profile (only if these fields are missing from body)
    const needsPrefill =
      !personalInfo &&
      !workExperience &&
      !education &&
      !skills &&
      !certificates;

    if (needsPrefill) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (profile) {
        personalInfo = profile.personalInfo || {};
        workExperience = profile.workExperience || [];
        education = profile.education || [];
        skills = profile.skills || [];
        certificates = profile.certificates || [];
      }
    }

    // Ensure personalInfo has at least the name from session if missing
    if (!personalInfo) personalInfo = {};
    if (!personalInfo.firstName && session.user.name) {
      const names = session.user.name.split(" ");
      personalInfo.firstName = names[0];
      if (names.length > 1 && !personalInfo.lastName) {
        personalInfo.lastName = names.slice(1).join(" ");
      }
    }
    if (!personalInfo.email && session.user.email) {
      personalInfo.email = session.user.email;
    }

    const resume = await (prisma.resume.create as any)({
      data: {
        title:
          body.title ||
          (personalInfo?.firstName && personalInfo?.lastName
            ? `Resume ${personalInfo.firstName} ${personalInfo.lastName}`
            : "New Resume"),
        template: body.template || "modern",
        language: body.language || "en",
        personalInfo: personalInfo || {},
        workExperience: workExperience || [],
        education: education || [],
        skills: skills || [],
        certificates: certificates || [],
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
