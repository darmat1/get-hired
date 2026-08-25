import { NextRequest, NextResponse } from "next/server";
import { authenticateAgentRequest, hasScope } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "cover_letters:read")) {
    return NextResponse.json(
      { error: "Missing required scope: cover_letters:read" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const coverLetter = await prisma.coverLetter.findFirst({
    where: { id, userId: ctx.userId },
  });

  if (!coverLetter) {
    return NextResponse.json({ error: "Cover letter not found" }, { status: 404 });
  }

  return NextResponse.json(coverLetter);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "cover_letters:write")) {
    return NextResponse.json(
      { error: "Missing required scope: cover_letters:write" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const existing = await prisma.coverLetter.findFirst({
    where: { id, userId: ctx.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Cover letter not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const { coverLetterText, format, language } = body;

  const coverLetter = await prisma.coverLetter.update({
    where: { id },
    data: {
      ...(coverLetterText !== undefined ? { coverLetterText } : {}),
      ...(format !== undefined ? { format } : {}),
      ...(language !== undefined ? { language } : {}),
    },
  });

  return NextResponse.json(coverLetter);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "cover_letters:write")) {
    return NextResponse.json(
      { error: "Missing required scope: cover_letters:write" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const existing = await prisma.coverLetter.findFirst({
    where: { id, userId: ctx.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Cover letter not found" }, { status: 404 });
  }

  await prisma.coverLetter.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
