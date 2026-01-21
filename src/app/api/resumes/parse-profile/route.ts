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

    // Text normalization to handle PDF artifacts
    const cleanText = (input: string) => {
      let text = input;
      
      // Fix spaced-out letters (e.g., "S e n i o r" -> "Senior")
      // Matches sequences of 3+ single letters separated by single spaces
      const spacingPattern = /(?:[A-Za-z]\s){2,}[A-Za-z]/g;
      text = text.replace(spacingPattern, (match) => match.replace(/\s/g, ''));
      
      return text
        .replace(/[•●▪◦▸►→✓✔]/g, '-')      // Convert bullets to dashes
        .replace(/[\t\r]/g, ' ')             // Tabs/returns to spaces  
        .replace(/\s{3,}/g, '  ')            // Max 2 consecutive spaces
        .replace(/\n{4,}/g, '\n\n\n')        // Max 3 consecutive newlines
        .trim();
    };

    const normalizedText = cleanText(text);

    // Helper: Extract JSON from potentially messy AI output
    const parseAIJSON = (content: string): any => {
      try {
        return JSON.parse(content);
      } catch (e) {
        // Find balanced JSON object
        const startIndices: number[] = [];
        for (let i = 0; i < content.length; i++) {
          if (content[i] === '{') startIndices.push(i);
        }

        for (const startIndex of startIndices) {
          let depth = 0;
          let endIndex = -1;
          for (let i = startIndex; i < content.length; i++) {
            if (content[i] === '{') depth++;
            if (content[i] === '}') depth--;
            if (depth === 0) {
              endIndex = i;
              break;
            }
          }

          if (endIndex !== -1) {
            try {
              const candidate = content.substring(startIndex, endIndex + 1);
              const parsed = JSON.parse(candidate);
              if (parsed && parsed.personalInfo) {
                return parsed;
              }
            } catch {
              // Continue to next start point
            }
          }
        }
        throw e;
      }
    };

    const systemPrompt = `You are a TEXT EXTRACTION tool, NOT a resume enhancer.

CRITICAL RULE: You must ONLY extract text that is LITERALLY written in the input. 
Do NOT add, invent, assume, or enhance ANY information.
If something is not explicitly stated, use empty string "" or empty array [].

Output format: Valid JSON matching this schema:
{
  "personalInfo": {
    "firstName": "", "lastName": "", "email": "", "phone": "", "location": "", "website": "", "summary": ""
  },
  "workExperience": [
    {
      "title": "", "company": "", "location": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "current": false,
      "description": []
    }
  ],
  "education": [
    {
      "institution": "", "degree": "", "field": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "current": false, "gpa": ""
    }
  ],
  "skills": [
    { "name": "", "category": "technical", "level": "advanced" }
  ]
}

Rules:
- COPY text exactly as written. Do not rephrase.
- NO hallucinations. If text says "Next.js", write "Next.js", not "Next.js and React".
- Each job = exactly ONE entry. Do not split or duplicate.
- Dates: "11/2022" = "2022-11", "Present" = current:true + endDate:"".
- Skills: Extract ONLY skills listed in the SKILLS section. Category: technical/soft/language.
- Languages section: category = "language".`;

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
            content: normalizedText,
          },
        ],
        temperature: 0.1,
        max_tokens: 4096,
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

      // Fallback: Try to extract JSON from failed_generation field
      if (errorText.includes("json_validate_failed")) {
        try {
          const errorBody = JSON.parse(errorText);
          const failedGeneration = errorBody?.error?.failed_generation;
          if (failedGeneration) {
            const fallbackData = parseAIJSON(failedGeneration);
            
            // Process and save (inline to avoid duplication issues)
            const processItem = (item: any) => ({ ...item, id: crypto.randomUUID() });
            
            const resume = await prisma.resume.create({
              data: {
                userId: session.user.id,
                title: `Imported Profile - ${new Date().toLocaleDateString()}`,
                template: "modern",
                personalInfo: fallbackData.personalInfo || {},
                workExperience: (fallbackData.workExperience || []).map((exp: any) => ({
                  ...processItem(exp),
                  title: exp.title || exp.position || "",
                  description: Array.isArray(exp.description) ? exp.description : [],
                  current: !!exp.current || (!exp.endDate && exp.startDate),
                })),
                education: (fallbackData.education || []).map((edu: any) => ({
                  ...processItem(edu),
                  current: !!edu.current || (!edu.endDate && edu.startDate),
                })),
                skills: (fallbackData.skills || []).map((skill: any) => ({
                  ...processItem(skill),
                  category: skill.category || "technical",
                  level: skill.level || "advanced",
                })),
                certificates: [],
              },
            });
            
            return NextResponse.json({ success: true, resume });
          }
        } catch (fallbackError) {
          console.error("Fallback extraction failed:", fallbackError);
        }
      }


      throw new Error(`Failed to parse profile with Groq: ${response.status} ${response.statusText}`);
    }

    const groqData = await response.json();
    const parsedData = parseAIJSON(groqData.choices?.[0]?.message?.content || "{}");


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
