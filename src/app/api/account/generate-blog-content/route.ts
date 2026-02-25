import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { aiComplete } from "@/lib/ai/server-ai";

// Generate blog post content in EN/RU/UK based on topic and requirements
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, requirements, slug } = await request.json();
    if (!topic || !requirements) {
      return NextResponse.json(
        { error: "Topic and requirements are required" },
        { status: 400 },
      );
    }

    // English content
    const enPrompt = {
      systemPrompt: "You are a professional blog writer. Write in clear, engaging English.",
      userPrompt: `Topic: ${topic}\nRequirements: ${requirements}\nPlease provide a blog post in English about the topic. Output a JSON object with fields { "title": "...", "body": "..." }.`,
      temperature: 0.3,
      maxTokens: 1500,
      responseFormat: { type: "json_object" } as any,
    };
    const enRes = await aiComplete(enPrompt, session.user?.id);
    let enObj: { title: string; body: string } = { title: topic, body: "" };
    try {
      enObj = JSON.parse(enRes.content);
    } catch {
      // Fallback: use content as body, derive a simple title
      enObj = { title: topic, body: enRes.content };
    }

    // Russian content
    const ruPrompt = {
      systemPrompt: "You are a professional blog writer. Write in clear, engaging Russian.",
      userPrompt: `Тема: ${topic}\nТребования: ${requirements}\nНапишите блог на русском языке. Выведите результат как JSON: {"title": "...", "body": "..."}.`,
      temperature: 0.3,
      maxTokens: 1500,
      responseFormat: { type: "json_object" } as any,
    };
    const ruRes = await aiComplete(ruPrompt, session.user?.id);
    let ruObj: { title: string; body: string } = { title: topic, body: "" };
    try {
      ruObj = JSON.parse(ruRes.content);
    } catch {
      ruObj = { title: topic, body: ruRes.content };
    }

    // Ukrainian content
    const ukPrompt = {
      systemPrompt: "You are a professional blog writer. Write in clear, engaging Ukrainian.",
      userPrompt: `Тема: ${topic}\nВимоги: ${requirements}\nНапишіть блог українською. Виведіть результат як JSON: {"title": "...", "body": "..."}.`,
      temperature: 0.3,
      maxTokens: 1500,
      responseFormat: { type: "json_object" } as any,
    };
    const ukRes = await aiComplete(ukPrompt, session.user?.id);
    let ukObj: { title: string; body: string } = { title: topic, body: "" };
    try {
      ukObj = JSON.parse(ukRes.content);
    } catch {
      ukObj = { title: topic, body: ukRes.content };
    }

    // Build HTML-wrapped content payload for the post
    const escapeHtml = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const wrapBodyForLang = (
      topicLang: string,
      introHtml: string,
      bodyHtml: string,
      langHeader: string,
    ) => {
      const h1 = `<h1>${escapeHtml(topicLang)}</h1>`;
      const intro = `<p>${introHtml}</p>`;
      const h2 = `<h2>${langHeader}</h2>`;
      return `${h1}${intro}${h2}${bodyHtml}`;
    };

    const introEn = "This article discusses how to craft effective resumes and highlight key achievements.";
    const introRu = "Эта статья объясняет, как эффективно оформлять резюме и выделять ключевые достижения.";
    const introUk = "Ця стаття пояснює, як ефективно оформлювати резюме та виокремлювати ключові досягнення.";

    const bodyEnHtml = wrapBodyForLang(enObj.title || topic, introEn, enObj.body, "Overview");
    const bodyRuHtml = wrapBodyForLang(ruObj.title || topic, introRu, ruObj.body, "Обзор");
    const bodyUkHtml = wrapBodyForLang(ukObj.title || topic, introUk, ukObj.body, "Огляд");

    const content = {
      en: { title: enObj.title, body: bodyEnHtml },
      ru: { title: ruObj.title, body: bodyRuHtml },
      uk: { title: ukObj.title, body: bodyUkHtml },
    };

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error generating blog content:", error);
    return NextResponse.json({ error: "Error generating blog content" }, { status: 500 });
  }
}
