import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { fetchLinkedInProfile } from "@/lib/linkedin";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get LinkedIn account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "linkedin",
      },
    });

    if (!account || !account.accessToken) {
      return NextResponse.json(
        { error: "LinkedIn account not connected" },
        { status: 400 }
      );
    }

    // Fetch LinkedIn profile data
    const linkedInData = await fetchLinkedInProfile(account.accessToken);

    // Create resume from LinkedIn profile
    const personalInfo = {
      name: `${linkedInData.firstName} ${linkedInData.lastName}`.trim(),
      email: session.user.email,
      phone: linkedInData.phone || "",
      location: linkedInData.location || "",
      website: linkedInData.website || "",
      summary: linkedInData.summary || "",
    };

    const workExperience = (linkedInData.experience || []).map((exp: any) => ({
      position: exp.title || "",
      company: exp.companyName || "",
      location: exp.location || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      description: exp.description || "",
    }));

    const education = (linkedInData.education || []).map((edu: any) => ({
      institution: edu.schoolName || "",
      degree: edu.degreeName || "",
      field: edu.fieldOfStudy || "",
      startDate: edu.startDate || "",
      endDate: edu.endDate || "",
      gpa: "",
    }));

    const skills = (linkedInData.skills || []).map((skill: any) => ({
      name: typeof skill === "string" ? skill : skill.name || "",
      level: "intermediate",
    }));

    // Create resume in database
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: `LinkedIn Profile - ${new Date().toLocaleDateString()}`,
        template: "modern",
        personalInfo,
        workExperience,
        education,
        skills,
      },
    });

    return NextResponse.json({
      success: true,
      resume: resume,
    });
  } catch (error) {
    console.error("Error importing LinkedIn profile:", error);
    return NextResponse.json(
      { error: "Error importing LinkedIn profile" },
      { status: 500 }
    );
  }
}
