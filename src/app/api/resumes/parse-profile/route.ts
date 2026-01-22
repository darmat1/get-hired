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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Profile text is required" },
        { status: 400 }
      );
    }

    const cleanText = (input: string) => {
      let text = input;
      // Fix spaced-out letters (e.g., "S e n i o r")
      const spacingPattern = /(?:[A-Za-z]\s{1,2}){2,}[A-Za-z]/g;
      text = text.replace(spacingPattern, (match) => match.replace(/\s+/g, ''));
      
      return text
        .replace(/[•●▪◦▸►→✓✔]/g, '-')
        .replace(/[\t\r]/g, ' ')
        .replace(/[^\S\n]{3,}/g, '  ') // Keep structure but reduce huge gaps
        .replace(/\n{4,}/g, '\n\n')
        .trim();
    };

    const normalizedText = cleanText(text);

    const systemPrompt = `You are an expert Resume Parser. 
The user will provide text extracted from a PDF. 
WARNING: The text is likely SCRAMBLED because the PDF had 2 COLUMNS. 
Lines from the left column (e.g., Contact, Skills) might be interleaved with lines from the right column (e.g., Experience).

YOUR TASK:
1. Mentally "untangle" the text. Separate the Contact/Skills sections from the Experience history based on context.
2. Extract the data into the JSON schema below.
3. CRITICAL RULE: VERBATIM EXTRACTION. 
   - DO NOT INVENT LOCATIONS. If the university name does not have a location next to it, leave location empty. 
   - DO NOT mix up the "Job Location" with "University Location".
   - If a date is "2 years 2 months", extract the actual Start/End dates if available, or leave dates empty.

JSON Schema:
{
  "personalInfo": {
    "firstName": "string", "lastName": "string", "email": "string", "phone": "string", "location": "string", "summary": "string"
  },
  "workExperience": [
    {
      "title": "string", "company": "string", "location": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM or Present", "current": boolean, "description": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string", "degree": "string", "field": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "current": boolean
    }
  ],
  "skills": [
    { "name": "string", "category": "technical", "level": "advanced" }
  ]
}

Return ONLY valid JSON. Wrap it in \`\`\`json\`\`\` if necessary.`;


    const parseAIJSON = (content: string): any => {
      // Remove markdown code blocks if present
      const cleaned = content
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        // Fallback: extract substring between first { and last }
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          try {
             return JSON.parse(cleaned.substring(start, end + 1));
          } catch (e2) {
             console.error("JSON parse failed even after cleanup", e2);
             throw new Error("Invalid JSON format from AI");
          }
        }
        throw e;
      }
    };

    let aiContent = "";

    if (process.env.OPENROUTER_API_KEY) {
      console.log("Attempting OpenRouter parsing...");
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Resume Parser",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-lite-preview-02-05:free", 
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `EXTRACT JSON FROM THIS RESUME TEXT:\n\n${normalizedText}` }
            ],
            temperature: 0, 
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiContent = data.choices?.[0]?.message?.content || "";
          console.log("OpenRouter success.");
        } else {
          console.error("OpenRouter API Error:", response.status);
        }
      } catch (err) {
        console.error("OpenRouter fetch failed:", err);
      }
    }

    if (!aiContent && process.env.GROQ_API_KEY) {
      console.log("Falling back to Groq...");
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: normalizedText },
            ],
            temperature: 0.1,
            max_tokens: 4096,
            response_format: { type: "json_object" },
          }),
        });

        if (response.ok) {
          const groqData = await response.json();
          aiContent = groqData.choices?.[0]?.message?.content || "";
        } else {
            // Tryung to recover data from error message if it possible
            const errText = await response.text();
            if (errText.includes("failed_generation")) {
                const errJson = JSON.parse(errText);
                aiContent = errJson?.error?.failed_generation || "";
            }
        }
      } catch (e) {
          console.error("Groq fallback error:", e);
      }
    }

    if (!aiContent) {
      throw new Error("Failed to parse profile with both OpenRouter and Groq");
    }

    const parsedData = parseAIJSON(aiContent);
    const safeStr = (val: any) => (typeof val === 'string' ? val : "");

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: `Imported Profile - ${new Date().toLocaleDateString()}`,
        template: "modern",
        personalInfo: {
            firstName: safeStr(parsedData.personalInfo?.firstName),
            lastName: safeStr(parsedData.personalInfo?.lastName),
            email: safeStr(parsedData.personalInfo?.email),
            phone: safeStr(parsedData.personalInfo?.phone),
            location: safeStr(parsedData.personalInfo?.location),
            summary: safeStr(parsedData.personalInfo?.summary),
        },
        workExperience: (parsedData.workExperience || []).map((exp: any) => ({
          id: crypto.randomUUID(),
          title: exp.title || exp.position || "Position",
          company: exp.company || "Company",
          location: exp.location || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          current: !!exp.current || (!exp.endDate && !!exp.startDate),
          description: Array.isArray(exp.description) ? exp.description : [safeStr(exp.description)],
        })),
        education: (parsedData.education || []).map((edu: any) => ({
           id: crypto.randomUUID(),
           institution: edu.institution || "Institution",
           degree: edu.degree || "",
           field: edu.field || "",
           startDate: edu.startDate || "",
           endDate: edu.endDate || "",
           current: !!edu.current
        })),
        skills: (parsedData.skills || []).map((skill: any) => ({
           id: crypto.randomUUID(),
           name: typeof skill === 'string' ? skill : skill.name,
           category: skill.category || "technical",
           level: skill.level || "advanced"
        })),
        certificates: [],
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