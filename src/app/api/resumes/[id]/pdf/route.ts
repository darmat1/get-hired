import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

    // If we have at least a name, use the preferred format
    if (firstName || lastName) {
      const namePart = [firstName, lastName].filter(Boolean).join("-");
      const parts = [namePart];

      if (targetPosition) parts.push(targetPosition);
      if (targetCompany) parts.push(targetCompany);

      // If we have more than just the name, or if it's tailored, prioritize this format
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

  // Fallback to title-based filename
  const cleanTitle = (resume.title || "untitled")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_\-]/g, "");
  return `resume-${cleanTitle}.pdf`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found", status: 404 });
    }

    const pdfBuffer = await generatePDF(resume as any);
    const filename = getFilenameForResume(resume);

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
