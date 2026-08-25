import { NextRequest, NextResponse } from "next/server";
import { authenticateAgentRequest, hasScope } from "@/lib/agent-auth";
import { generatePDF } from "@/lib/pdf-generator";
import { prisma } from "@/lib/prisma";

function getFilenameForResume(resume: any): string {
  try {
    const personalInfo =
      typeof resume.personalInfo === "string"
        ? JSON.parse(resume.personalInfo)
        : resume.personalInfo;

    const firstName = (personalInfo?.firstName || "").trim();
    const lastName = (personalInfo?.lastName || "").trim();

    const targetPosition = (resume.targetPosition || "").trim();
    const targetCompany = (resume.targetCompany || "").trim();

    if (firstName || lastName) {
      const namePart = [firstName, lastName].filter(Boolean).join("-");
      const parts = [namePart];

      if (targetPosition) parts.push(targetPosition);
      if (targetCompany) parts.push(targetCompany);

      if (parts.length > 1 || resume.title?.startsWith("Tailored:")) {
        const baseName = parts
          .join("_")
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9_\-]/g, "");
        return `${baseName}.pdf`;
      }
    }
  } catch (e) {
    console.error("Error constructing filename:", e);
  }

  const cleanTitle = (resume.title || "untitled")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_\-]/g, "");
  return `resume-${cleanTitle}.pdf`;
}

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

    const pdfBuffer = await generatePDF(resume as any);
    const filename = getFilenameForResume(resume);

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error("Error generating agent resume PDF:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
