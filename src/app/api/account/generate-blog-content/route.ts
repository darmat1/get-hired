import { auth } from "@/lib/auth";
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

    // --- 1. ENGLISH CONTENT ---
    const enPrompt = {
      systemPrompt: `You are an expert career coach and SEO copywriter for "gethired.work" (an advanced AI resume builder and career assistant). 
Write a highly engaging, professional, 500-1000 words and SEO-optimized blog post in English.

Formatting Requirements:
1. Output MUST be a valid JSON object strictly matching this format: {"title": "...", "excerpt": "...", "body": "..."}
2. The "excerpt" should be a catchy 2-sentence summary for SEO.
3. The "body" must be formatted in clean, valid HTML. Use <h2>, <h3>, <p>, <ul>, <li>.
4. DO NOT use Markdown formatting. Use ONLY HTML tags.
5. DO NOT include an <h1> tag in the body.

JSON Escaping Rules (CRITICAL):
- Use ONLY single quotes for HTML attributes inside the body (e.g., <a href='https://gethired.work'>). DO NOT use double quotes inside the HTML.
- Format the entire HTML string as a single continuous line without raw line breaks, or properly escape newlines as \\n.

Internal Linking Strategy:
You must organically include up to 3 internal links from the list below where they fit naturally. Do NOT use more than 3 links.
- https://gethired.work/resume-builder
- https://gethired.work/cover-letter
- https://gethired.work/linkedin-import
- https://gethired.work/ai
- https://gethired.work/pricing

Content Requirements:
1. Organically include keywords: 'resume builder', 'CV maker', 'AI career assistant', 'job application tips'.
2. Structure: Catchy intro, actionable main points, conclusion.
3. End with a CTA inviting the reader to build their ATS-friendly resume at <a href='https://gethired.work'>gethired.work</a>.`,
      userPrompt: `Topic: ${topic}\nSpecific Requirements: ${requirements}\n\nGenerate the English blog post JSON.`,
      temperature: 0.4,
      maxTokens: 3000,
      responseFormat: { type: "json_object" } as any,
    };

    // --- 2. RUSSIAN CONTENT ---
    const ruPrompt = {
      systemPrompt: `Вы — эксперт по карьерному консультированию и профессиональный SEO-копирайтер для сервиса "gethired.work" (AI-конструктор резюме). 
Напишите вовлекающую, полезную и SEO-оптимизированную статью на 500-1000 слов для блога на русском языке.

Требования к формату:
1. Результат ДОЛЖЕН быть валидным JSON объектом строго в таком формате: {"title": "...", "excerpt": "...", "body": "..."}
2. "excerpt" — это краткое описание статьи (2-3 предложения).
3. "body" должно содержать чистый, валидный HTML (h2, h3, p, ul/li).
4. НЕ используйте Markdown. Только HTML-теги.
5. НЕ используйте тег <h1> внутри "body".

Правила JSON (КРИТИЧЕСКИ ВАЖНО):
- Используйте ТОЛЬКО одинарные кавычки для HTML-атрибутов (например, <a href='https://...'>). НЕ используйте двойные кавычки внутри HTML текста.
- Весь HTML код должен быть написан в одну строку без реальных переносов строк, либо используйте правильное экранирование \\n.

Стратегия внутренних ссылок:
Органично впишите в текст максимум 3 внутренние ссылки из списка ниже.
- https://gethired.work/ru/resume-builder
- https://gethired.work/ru/cover-letter
- https://gethired.work/ru/linkedin-import
- https://gethired.work/ru/ai
- https://gethired.work/ru/pricing

Требования к контенту:
1. Ключевые слова: 'создать резюме', 'конструктор резюме', 'AI карьерный помощник'.
2. В конце добавьте CTA: создайте идеальное резюме на <a href='https://gethired.work'>gethired.work</a>.`,
      userPrompt: `Тема: ${topic}\nСпецифические требования: ${requirements}\n\nСгенерируйте JSON статьи на русском языке.`,
      temperature: 0.4,
      maxTokens: 3000,
      responseFormat: { type: "json_object" } as any,
    };

    // --- 3. UKRAINIAN CONTENT ---
    const ukPrompt = {
      systemPrompt: `Ви — експерт з кар'єрного консультування та професійний SEO-копірайтер для сервісу "gethired.work" (AI-конструктор резюме). 
Напишіть цікаву, корисну та SEO-оптимізовану статтю на 500-1000 слів для блогу українською мовою.

Вимоги до формату:
1. Результат МАЄ БУТИ валідним JSON об'єктом у такому форматі: {"title": "...", "excerpt": "...", "body": "..."}
2. "excerpt" — це короткий опис статті (2-3 речення).
3. "body" має містити чистий, валідний HTML (h2, h3, p, ul/li).
4. НЕ використовуйте Markdown. Тільки HTML-теги.
5. НЕ використовуйте тег <h1> всередині "body".

Правила JSON (КРИТИЧНО ВАЖЛИВО):
- Використовуйте ТІЛЬКИ одинарні лапки для HTML-атрибутів (наприклад, <a href='https://...'>). НЕ використовуйте подвійні лапки всередині HTML тексту.
- Весь HTML код має бути написаний в один рядок без реальних переносів рядків, або використовуйте правильне екранування \\n.

Стратегія внутрішніх посилань:
Органічно вставте в текст максимум 3 внутрішні посилання зі списку нижче.
- https://gethired.work/uk/resume-builder
- https://gethired.work/uk/cover-letter
- https://gethired.work/uk/linkedin-import
- https://gethired.work/uk/ai
- https://gethired.work/uk/pricing

Вимоги до контенту:
1. Ключові слова: 'створити резюме', 'конструктор резюме', 'AI кар'єрний помічник'.
2. Наприкінці додайте CTA: створіть ідеальне резюме на <a href='https://gethired.work'>gethired.work</a>.`,
      userPrompt: `Тема: ${topic}\nСпецифічні вимоги: ${requirements}\n\nЗгенеруйте JSON статті українською мовою.`,
      temperature: 0.4,
      maxTokens: 3000,
      responseFormat: { type: "json_object" } as any,
    };

    const [enRes, ruRes, ukRes] = await Promise.all([
      aiComplete(enPrompt, session.user?.id),
      aiComplete(ruPrompt, session.user?.id),
      aiComplete(ukPrompt, session.user?.id),
    ]);

    const parseAiResponse = (resContent: string, fallbackTopic: string) => {
      try {
        const parsed = JSON.parse(resContent);
        return {
          title: parsed.title || fallbackTopic,
          excerpt: parsed.excerpt || "",
          body: parsed.body || "<p>Content generation failed.</p>",
        };
      } catch (e) {
        console.error("Failed to parse AI JSON:", resContent);
        return {
          title: fallbackTopic,
          excerpt: "",
          body: `<p>${resContent}</p>`,
        };
      }
    };

    const content = {
      en: parseAiResponse(enRes.content, topic),
      ru: parseAiResponse(ruRes.content, topic),
      uk: parseAiResponse(ukRes.content, topic),
    };

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error generating blog content:", error);
    return NextResponse.json(
      { error: "Error generating blog content" },
      { status: 500 },
    );
  }
}
