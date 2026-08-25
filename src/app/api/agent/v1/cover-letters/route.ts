import { NextRequest, NextResponse } from "next/server";
import { authenticateAgentRequest, hasScope } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "cover_letters:read")) {
    return NextResponse.json(
      { error: "Missing required scope: cover_letters:read" },
      { status: 403 },
    );
  }

  const coverLetters = await prisma.coverLetter.findMany({
    where: { userId: ctx.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    coverLetters.map((cl) => ({
      id: cl.id,
      jobDescription: cl.jobDescription.slice(0, 200),
      format: cl.format,
      language: cl.language,
      resumeId: cl.resumeId,
      createdAt: cl.createdAt,
      updatedAt: cl.updatedAt,
    })),
  );
}

export async function POST(request: NextRequest) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "cover_letters:write")) {
    return NextResponse.json(
      { error: "Missing required scope: cover_letters:write" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const { jobDescription, coverLetterText, format, language, resumeId } = body;

  if (!jobDescription || !coverLetterText) {
    return NextResponse.json(
      { error: "jobDescription and coverLetterText are required" },
      { status: 400 },
    );
  }

  if (resumeId) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: ctx.userId },
    });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
  }

  // Enforce the same 2-record cap as the AI-generation path (evict oldest).
  const existingCount = await prisma.coverLetter.count({
    where: { userId: ctx.userId },
  });
  if (existingCount >= 2) {
    const oldest = await prisma.coverLetter.findFirst({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "asc" },
    });
    if (oldest) {
      await prisma.coverLetter.delete({ where: { id: oldest.id } });
    }
  }

  const coverLetter = await prisma.coverLetter.create({
    data: {
      jobDescription,
      coverLetterText,
      format: format || "bullet",
      language: language || "en",
      userId: ctx.userId,
      resumeId: resumeId || null,
    },
  });

  return NextResponse.json(coverLetter, { status: 201 });
}
