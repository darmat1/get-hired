import { NextRequest, NextResponse } from "next/server";
import { authenticateAgentRequest, hasScope } from "@/lib/agent-auth";
import { generateResumeForUser } from "@/lib/agent/resume-generation";

export async function POST(request: NextRequest) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "ai:generate")) {
    return NextResponse.json(
      { error: "Missing required scope: ai:generate" },
      { status: 403 },
    );
  }
  if (!hasScope(ctx, "resumes:write")) {
    return NextResponse.json(
      { error: "Missing required scope: resumes:write" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const { targetRole, jobDescription, template } = body;

  const result = await generateResumeForUser(ctx.userId, {
    targetRole,
    jobDescription,
    template,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, ...(result.limitReached ? { limitReached: true } : {}) },
      { status: result.status },
    );
  }

  return NextResponse.json(
    {
      resumeId: result.resumeId,
      title: result.title,
      url: `/resume/${result.resumeId}/edit`,
    },
    { status: 201 },
  );
}
