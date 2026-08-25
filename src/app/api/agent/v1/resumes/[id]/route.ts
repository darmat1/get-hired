import { NextRequest, NextResponse } from "next/server";
import { authenticateAgentRequest, hasScope } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "resumes:read")) {
    return NextResponse.json(
      { error: "Missing required scope: resumes:read" },
      { status: 403 },
    );
  }

  try {
    const { id } = await params;
    const resume = await prisma.resume.findFirst({
      where: { id, userId: ctx.userId },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error fetching agent resume:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const UPDATABLE_FIELDS = [
  "title",
  "template",
  "personalInfo",
  "workExperience",
  "education",
  "skills",
  "certificates",
  "customization",
  "language",
  "targetPosition",
  "targetCompany",
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "resumes:write")) {
    return NextResponse.json(
      { error: "Missing required scope: resumes:write" },
      { status: 403 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.resume.findFirst({
      where: { id, userId: ctx.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    for (const field of UPDATABLE_FIELDS) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    const updated = await prisma.resume.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating agent resume:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "resumes:write")) {
    return NextResponse.json(
      { error: "Missing required scope: resumes:write" },
      { status: 403 },
    );
  }

  try {
    const { id } = await params;

    const existing = await prisma.resume.findFirst({
      where: { id, userId: ctx.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    await prisma.resume.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting agent resume:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
