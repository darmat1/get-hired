import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({
        personalInfo: {},
        workExperience: [],
        education: [],
        skills: [],
        certificates: [],
      });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("GET Profile Experience Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        personalInfo: body.personalInfo || {},
        workExperience: body.workExperience || [],
        education: body.education || [],
        skills: body.skills || [],
        certificates: body.certificates || [],
      },
      create: {
        userId: session.user.id,
        personalInfo: body.personalInfo || {},
        workExperience: body.workExperience || [],
        education: body.education || [],
        skills: body.skills || [],
        certificates: body.certificates || [],
      },
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("PUT Profile Experience Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
