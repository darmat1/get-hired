import { NextRequest, NextResponse } from "next/server";
import { authenticateAgentRequest, hasScope } from "@/lib/agent-auth";
import { generateCoverLetterForUser } from "@/lib/agent/cover-letter-generation";

export async function POST(request: NextRequest) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(ctx, "ai:generate")) {
    return NextResponse.json(
      { error: "Missing required scope: ai:generate" },
      { status: 403 },
    );
  }
  if (!hasScope(ctx, "cover_letters:write")) {
    return NextResponse.json(
      { error: "Missing required scope: cover_letters:write" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const { jobDescription, format, language, resumeId } = body;

  const result = await generateCoverLetterForUser(ctx.userId, {
    jobDescription,
    format,
    language,
    resumeId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(
    { coverLetterId: result.coverLetterId, coverLetterText: result.coverLetterText },
    { status: 201 },
  );
}
