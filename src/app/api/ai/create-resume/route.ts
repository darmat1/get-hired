import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { generateResumeForUser } from "@/lib/agent/resume-generation";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { targetRole, jobDescription, template } = body;

    const result = await generateResumeForUser(session.user.id, {
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

    return NextResponse.json({
      resumeId: result.resumeId,
      title: result.title,
      url: `/resume/${result.resumeId}/edit`,
    });
  } catch (err: unknown) {
    console.error("[create-resume error]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
