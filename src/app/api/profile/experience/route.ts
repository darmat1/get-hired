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

    const parseField = (field: any) => {
      if (!field) return {};
      if (typeof field === 'object') return field;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return field;
        }
      }
      return {};
    };

    const parseArrayField = (field: any) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return [];
        }
      }
      return [];
    };

    return NextResponse.json({
      id: profile.id,
      userId: profile.userId,
      personalInfo: parseField(profile.personalInfo),
      workExperience: parseArrayField(profile.workExperience),
      education: parseArrayField(profile.education),
      skills: parseArrayField(profile.skills),
      certificates: parseArrayField(profile.certificates),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
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

    const toJsonString = (data: any) => {
      if (!data) return null;
      if (typeof data === 'string') return data;
      return JSON.stringify(data);
    };

    const profile = await (prisma.userProfile.upsert as any)({
      where: { userId: session.user.id },
      update: {
        personalInfo: toJsonString(body.personalInfo),
        workExperience: toJsonString(body.workExperience),
        education: toJsonString(body.education),
        skills: toJsonString(body.skills),
        certificates: toJsonString(body.certificates),
      },
      create: {
        userId: session.user.id,
        personalInfo: toJsonString(body.personalInfo),
        workExperience: toJsonString(body.workExperience),
        education: toJsonString(body.education),
        skills: toJsonString(body.skills),
        certificates: toJsonString(body.certificates),
      },
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("PUT Profile Experience Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
