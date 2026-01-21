import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Profile text is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert at parsing professional profiles and resumes. 
Your task is to extract information from the provided text and format it into a structured JSON object.

Rules:
1. Return ONLY a valid JSON object.
2. If information is missing, use empty strings or empty arrays.
3. The JSON structure MUST match this exactly:
{
  "personalInfo": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "website": "string",
    "summary": "string"
  },
  "workExperience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "current": boolean,
      "description": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "current": boolean,
      "gpa": "string"
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "technical" | "soft" | "language",
      "level": "beginner" | "intermediate" | "advanced" | "expert"
    }
  ]
}

Specific Instructions:
- Dates: Dates MUST be in YYYY-MM format. If you see "Present", set current to true and leave endDate empty.
- Descriptions: Capture ALL responsibilities and achievements. Include bullet points like "Key Achievements" as separate items in the description array.
- Experience mapping: Use "title" (NOT "position").
- Multi-role: If a person has multiple roles in the same company (e.g., Senior Developer then Lead Developer), create SEPARATE entries for each role.
- Skills: Categorize skills accurately. Level is mandatory, use "advanced" as default if unclear.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.1, // Low temperature for consistent JSON
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to parse profile with Groq: ${response.status} ${response.statusText}`);
    }

    const groqData = await response.json();
    const parsedData = JSON.parse(groqData.choices?.[0]?.message?.content || "{}");

    // Post-processing to ensure IDs and data integrity
    const processItem = (item: any) => ({
      ...item,
      id: crypto.randomUUID(),
    });

    const workExperience = (parsedData.workExperience || []).map((exp: any) => ({
      ...processItem(exp),
      title: exp.title || exp.position || "", // Fallback for 'position' if AI slips up
      description: Array.isArray(exp.description) 
        ? exp.description 
        : typeof exp.description === 'string' 
          ? [exp.description] 
          : [],
      current: !!exp.current || (!exp.endDate && exp.startDate),
    }));

    const education = (parsedData.education || []).map((edu: any) => ({
      ...processItem(edu),
      current: !!edu.current || (!edu.endDate && edu.startDate),
    }));

    const skills = (parsedData.skills || []).map((skill: any) => ({
      ...processItem(skill),
      category: skill.category || "technical",
      level: skill.level || "advanced",
    }));

    // Create resume in database
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: `Imported Profile - ${new Date().toLocaleDateString()}`,
        template: "modern",
        personalInfo: parsedData.personalInfo || {},
        workExperience: workExperience,
        education: education,
        skills: skills,
        certificates: [], // Ensure certificates exists
      },
    });

    return NextResponse.json({
      success: true,
      resume: resume,
    });
  } catch (error) {
    console.error("Error parsing profile:", error);
    return NextResponse.json(
      { error: "Error parsing profile" },
      { status: 500 }
    );
  }
}
