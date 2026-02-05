import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { encode } from "@toon-format/toon";

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
        { status: 400 },
      );
    }

    const cleanText = (input: string) => {
      let text = input;
      text = text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "");

      // Fix spaced out text "S e n i o r" -> "Senior"
      const spacingPattern = /(?:[A-Za-z]\s{1,2}){2,}[A-Za-z]/g;
      text = text.replace(spacingPattern, (match) => match.replace(/\s+/g, ""));

      return text
        .replace(/[•●▪◦▸►→✓✔]/g, "-")
        .replace(/[^\S\n]{3,}/g, "  ")
        .replace(/\n{4,}/g, "\n\n")
        .trim();
    };

    const normalizedText = cleanText(text);

    const systemPrompt = `You are a Resume Parsing & Merging Engine.
INPUT: 
1. Raw text from a PDF or pasted text (New Data).
2. JSON of the user's EXISTING profile (Context Data).

YOUR GOAL:
1. Extract data from the New Data.
2. INTELLIGENTLY MERGE it into the Context Data.
3. If a work experience entry in New Data refers to the same company and role as an entry in Context Data, MERGE them:
   - Combine description bullet points (remove duplicates).
   - Use the most complete dates.
   - Normalize company names (e.g., "Boarding" and "b0arding.com" should be merged).
4. deduplicate skills and education entries similarly.
5. Return the FINAL, consolidated profile in the schema below.

STRICT RULES:
- Return ONLY valid JSON.
- Do NOT include markdown formatting.
- Do NOT invent data.
- If New Data is more detailed than Context Data for the same entry, prefer New Data.

JSON Schema:
{
  "personalInfo": {
    "firstName": "string", "lastName": "string", "email": "string", "phone": "string", "location": "string", "summary": "string"
  },
  "workExperience": [
    {
      "title": "string", "company": "string", "location": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "current": boolean, "description": ["string"]
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
}`;

    const parseAIJSON = (content: string): any => {
      if (!content) throw new Error("Empty AI Content");

      // Locate the JSON object strictly
      const firstBrace = content.indexOf("{");
      const lastBrace = content.lastIndexOf("}");

      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("AI response did not contain valid JSON brackets");
      }

      const jsonString = content.substring(firstBrace, lastBrace + 1);

      try {
        return JSON.parse(jsonString);
      } catch (e) {
        console.error("JSON Parse Error. Raw string:", jsonString);
        const fixed = jsonString.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
        return JSON.parse(fixed);
      }
    };

    // Find existing profile
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    const existingProfileToon = existingProfile
      ? encode(existingProfile)
      : "{}";

    const userPrompt = `EXISTING PROFILE (in TOON format):
${existingProfileToon}

NEW DATA TO PARSE:
${normalizedText}`;

    let aiContent = "";

    if (process.env.OPENROUTER_API_KEY) {
      console.log(
        `Attempting OpenRouter ${process.env.NEXT_PUBLIC_OPENROUTER_FREE_MODEL}`,
      );

      const payload = {
        model: process.env.NEXT_PUBLIC_OPENROUTER_FREE_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0, // Deterministic output
      };

      try {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer":
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              "X-Title": "Resume Parser",
            },
            body: JSON.stringify(payload),
          },
        );

        if (response.ok) {
          const data = await response.json();
          aiContent = data.choices?.[0]?.message?.content || "";
          console.log("OpenRouter Success. Content extracted.");
        } else {
          const errorText = await response.text();
          console.error(`OpenRouter Error (${response.status}):`, errorText);
        }
      } catch (err) {
        console.error("OpenRouter fetch failed:", err);
      }
    }

    if (!aiContent && process.env.GROQ_API_KEY) {
      console.log("Falling back to Groq...");
      try {
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0,
              response_format: { type: "json_object" },
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          aiContent = data.choices?.[0]?.message?.content || "";
        }
      } catch (e) {
        console.error("Groq fallback failed:", e);
      }
    }

    if (!aiContent) {
      return NextResponse.json({ error: "AI Parsing Failed" }, { status: 500 });
    }

    const parsedData = parseAIJSON(aiContent);
    const safeStr = (val: any) => (typeof val === "string" ? val : "");

    // Prepare combined data (trusting AI to have merged, but ensuring structure/IDs)
    const finalPersonalInfo = {
      firstName: safeStr(parsedData.personalInfo?.firstName),
      lastName: safeStr(parsedData.personalInfo?.lastName),
      email: safeStr(parsedData.personalInfo?.email),
      phone: safeStr(parsedData.personalInfo?.phone),
      location: safeStr(parsedData.personalInfo?.location),
      summary: safeStr(parsedData.personalInfo?.summary),
    };

    const finalWorkExperience = (parsedData.workExperience || []).map(
      (exp: any) => ({
        id: exp.id || crypto.randomUUID(),
        title: exp.title || "Position",
        company: exp.company || "Company",
        location: exp.location || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        current: !!exp.current,
        description: Array.isArray(exp.description)
          ? exp.description
          : [safeStr(exp.description)],
      }),
    );

    const finalEducation = (parsedData.education || []).map((edu: any) => ({
      id: edu.id || crypto.randomUUID(),
      institution: edu.institution || "Institution",
      degree: edu.degree || "",
      field: edu.field || "",
      startDate: edu.startDate || "",
      endDate: edu.endDate || "",
      current: !!edu.current,
    }));

    const finalSkills = (parsedData.skills || []).map((skill: any) => ({
      id: skill.id || crypto.randomUUID(),
      name: typeof skill === "string" ? skill : skill.name,
      category: skill.category || "technical",
      level: skill.level || "advanced",
    }));

    if (existingProfile) {
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: {
          personalInfo: finalPersonalInfo,
          workExperience: finalWorkExperience,
          education: finalEducation,
          skills: finalSkills,
        },
      });
    } else {
      await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          personalInfo: finalPersonalInfo,
          workExperience: finalWorkExperience,
          education: finalEducation,
          skills: finalSkills,
          certificates: [],
        },
      });
    }

    return NextResponse.json({ success: true, message: "Profile updated" });
  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
