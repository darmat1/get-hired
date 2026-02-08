import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { encode, decode } from "@toon-format/toon";

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
INPUT: Existing profile in TOON format + raw text from PDF/paste.

GOAL: Extract and merge data. Return consolidated profile in TOON format.

MERGE RULES:
- Same company+role = combine descriptions, use best dates
- Normalize company names ("Boarding" = "b0arding.com")
- Deduplicate skills and education
- Prefer more detailed data

RETURN IN TOON FORMAT:
personalInfo:
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  summary: string
workExperience[N]{title,company,location,startDate,endDate,current,description}:
  Title,Company,Location,YYYY-MM,YYYY-MM,true/false,Description text
  ...
education[N]{institution,degree,field,startDate,endDate,current}:
  Institution,Degree,Field,YYYY-MM,YYYY-MM,true/false
  ...
skills[N]{name,category,level}:
  Skill Name,technical,advanced
  ...

RULES:
- Return ONLY valid TOON format (no JSON, no markdown)
- Do NOT invent data
- Dates in YYYY-MM format`;

    const parseAIResponse = (content: string): any => {
      if (!content) throw new Error("Empty AI Content");

      // Try TOON first
      try {
        const decoded = decode(content, { strict: false }) as Record<
          string,
          unknown
        >;
        if (decoded.personalInfo || decoded.workExperience || decoded.skills) {
          return decoded;
        }
      } catch (e) {
        console.log("TOON parse failed, trying JSON fallback");
      }

      // Fallback to JSON
      const firstBrace = content.indexOf("{");
      const lastBrace = content.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("AI response did not contain valid data");
      }
      const jsonString = content.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonString);
      } catch (e) {
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
      //
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

    const parsedData = parseAIResponse(aiContent);
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
