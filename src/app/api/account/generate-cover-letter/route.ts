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

    const { jobDescription, language } = await request.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    const lang = language || "en";

    // Get all user's resumes
    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
    });

    if (!resumes || resumes.length === 0) {
      return NextResponse.json(
        { error: "No resumes found. Please create a resume first." },
        { status: 400 }
      );
    }

    // Parse resume data
    const resumeTexts = resumes.map((resume) => {
      const personalInfo = resume.personalInfo as Record<string, unknown>;
      const workExperience = resume.workExperience as Array<Record<string, unknown>>;
      const education = resume.education as Array<Record<string, unknown>>;
      const skills = resume.skills as Array<Record<string, unknown>>;
      return `
Name: ${personalInfo.name || ""}
Email: ${personalInfo.email || ""}
Phone: ${personalInfo.phone || ""}
Location: ${personalInfo.location || ""}
Summary: ${personalInfo.summary || ""}

Work Experience:
${Array.isArray(workExperience)
  ? workExperience
      .map(
        (work) =>
          `${work.company} - ${work.position} (${work.startDate} to ${work.endDate || "Present"})\n${work.description}`
      )
      .join("\n\n")
  : ""}

Education:
${Array.isArray(education)
  ? education
      .map(
        (edu) =>
          `${edu.degree} in ${edu.field} from ${edu.institution} (${edu.startDate} to ${edu.endDate})`
      )
      .join("\n\n")
  : ""}

Skills:
${Array.isArray(skills)
  ? skills
      .map((skill) => `${skill.name} (${skill.level})`)
      .join("\n")
  : ""}
`;
    });

    // Generate cover letter using AI
    const aiService = process.env.AI_SERVICE || "groq";

    let systemPrompt = "";
    let userPrompt = "";

    if (lang === "uk") {
      systemPrompt = `Ви експерт з написання професійних супровідних листів. Ваше завдання — писати переконливі, засновані на даних супровідні листи, які висвітлюють кількісні досягнення та безпосередньо розглядають вимоги вакансії.

Правила:
- Напишіть ТІЛЬКИ основне тіло супровідного листа (без привітання та завершення)
- Сконцентруйтесь на кількісних досягненнях, метриках та конкретних результатах
- Зіставте ключові вимоги з опису вакансії
- Використовуйте конкретні цифри, відсотки та вимірювані результати
- НЕ використовуйте універсальні фрази на кшталт "я завжди мріяв", "я стежу за вашою компанією", "ваші інноваційні продукти" тощо
- Зберіжіть лаконічність та впливовість - максимум 3-4 абзаци
- Використовуйте активний голос та сильні дієслова
- Покажіть прямий зв'язок між навичками кандидата та вимогами вакансії
- Висвітліть відповідні технології, методології та досягнення

Напишіть професійний супровідний лист, який виділить кандидата перед рекрутерами.`;
      userPrompt = `Опис вакансії:
${jobDescription}

Профіль кандидата з резюме:
${resumeTexts.join("\n---\n")}

Напишіть переконливий супровідний лист, який безпосередньо розглядає вимоги вакансії, використовуючи доведені досягнення та навички кандидата.`;
    } else if (lang === "ru") {
      systemPrompt = `Вы эксперт по написанию профессиональных сопроводительных писем. Ваша задача — писать убедительные, основанные на данных сопроводительные письма, которые освещают количественные достижения и напрямую решают требования вакансии.

Правила:
- Напишите ТОЛЬКО основное тело сопроводительного письма (без приветствия и заключения)
- Сосредоточьтесь на количественных достижениях, метриках и конкретных результатах
- Сопоставьте ключевые требования из описания вакансии
- Используйте конкретные цифры, проценты и измеримые результаты
- НЕ используйте универсальные фразы вроде "я всегда мечтал", "я слежу за вашей компанией", "ваши инновационные продукты" и т.д.
- Сохраняйте лаконичность и влиятельность - максимум 3-4 абзаца
- Используйте активный голос и сильные глаголы
- Покажите прямую связь между навыками кандидата и требованиями вакансии
- Выделите соответствующие технологии, методологии и достижения

Напишите профессиональное сопроводительное письмо, которое выделит кандидата перед рекрутерами.`;
      userPrompt = `Описание вакансии:
${jobDescription}

Профиль кандидата из резюме:
${resumeTexts.join("\n---\n")}

Напишите убедительное сопроводительное письмо, которое напрямую решает требования вакансии, используя доказанные достижения и навыки кандидата.`;
    } else {
      systemPrompt = `You are an expert professional cover letter writer. Your task is to write compelling, data-driven cover letters that highlight quantifiable achievements and directly address job requirements.

Rules:
- Write ONLY the cover letter body (no salutation or closing)
- Focus on quantifiable achievements, metrics, and specific accomplishments
- Match key requirements from the job description
- Use specific numbers, percentages, and measurable results
- Do NOT include generic phrases like "I have always dreamed", "I have been following your company", "your innovative products", etc.
- Keep it concise and impactful - maximum 3-4 paragraphs
- Use active voice and strong action verbs
- Show direct alignment between candidate skills and job requirements
- Highlight relevant technologies, methodologies, and achievements

Generate a professional cover letter that will make the candidate stand out to recruiters.`;
      userPrompt = `Job Description:
${jobDescription}

Candidate Profile from Resumes:
${resumeTexts.join("\n---\n")}

Generate a compelling cover letter that directly addresses the job requirements using the candidate's proven achievements and skills.`;
    }
    
    let coverLetter = "";

    if (aiService === "groq") {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover letter with Groq");
      }

      const data = await response.json();
      coverLetter = data.choices?.[0]?.message?.content || "";
    } else if (aiService === "openai") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an expert professional cover letter writer. Your task is to write compelling, data-driven cover letters that highlight quantifiable achievements and directly address job requirements.

Rules:
- Write ONLY the cover letter body (no salutation or closing)
- Focus on quantifiable achievements, metrics, and specific accomplishments
- Match key requirements from the job description
- Use specific numbers, percentages, and measurable results
- Do NOT include generic phrases like "I have always dreamed", "I have been following your company", "your innovative products", etc.
- Keep it concise and impactful - maximum 3-4 paragraphs
- Use active voice and strong action verbs
- Show direct alignment between candidate skills and job requirements
- Highlight relevant technologies, methodologies, and achievements

Generate a professional cover letter that will make the candidate stand out to recruiters.`,
            },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate cover letter with OpenAI");
  }

  const data = await response.json();
  coverLetter = data.choices?.[0]?.message?.content || "";
}

if (!coverLetter) {
      return NextResponse.json(
        { error: "Failed to generate cover letter" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      coverLetter: coverLetter.trim(),
    });
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { error: "Error generating cover letter" },
      { status: 500 }
    );
  }
}
