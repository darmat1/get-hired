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
Write a highly engaging, professional, and SEO-optimized blog post in English.

Formatting Requirements:
1. Output MUST be a valid JSON object strictly matching this format: {"title": "...", "excerpt": "...", "body": "..."}
2. The "excerpt" should be a catchy 2-sentence summary for SEO meta descriptions.
3. The "body" must be formatted in clean, valid HTML. Use <h2> for main sections, <h3> for subsections, <p> for text, and <ul>/<li> for lists.
4. DO NOT use Markdown formatting (like ** or #) in the body, use ONLY HTML tags.
5. DO NOT include an <h1> tag in the body (the title will be rendered as H1 on the page).

Content Requirements:
1. Organically include these keywords: 'resume builder', 'CV maker', 'AI career assistant', 'job application tips'.
2. Structure the post logically: Catchy introduction, actionable main points, and a conclusion.
3. End with a compelling Call To Action (CTA) inviting the reader to build their ATS-friendly resume in minutes at <a href="https://gethired.work">gethired.work</a>.`,
      userPrompt: `Topic: ${topic}\nSpecific Requirements: ${requirements}\n\nGenerate the English blog post JSON.`,
      temperature: 0.4,
      maxTokens: 2500, // Увеличил лимит токенов для полноценных статей
      responseFormat: { type: "json_object" } as any,
    };

    // --- 2. RUSSIAN CONTENT ---
    const ruPrompt = {
      systemPrompt: `Вы — эксперт по карьерному консультированию и профессиональный SEO-копирайтер для сервиса "gethired.work" (AI-конструктор резюме). 
Напишите вовлекающую, полезную и SEO-оптимизированную статью для блога на русском языке.

Требования к формату:
1. Результат ДОЛЖЕН быть валидным JSON объектом строго в таком формате: {"title": "...", "excerpt": "...", "body": "..."}
2. "excerpt" — это краткое, цепляющее описание статьи на 2-3 предложения (для мета-тегов).
3. "body" должно содержать чистый, валидный HTML. Используйте <h2> для главных разделов, <h3> для подразделов, <p> для абзацев и <ul>/<li> для списков.
4. НЕ используйте Markdown (звездочки, решетки). Только HTML-теги.
5. НЕ используйте тег <h1> внутри "body".

Требования к контенту:
1. Естественно впишите ключевые слова (можно склонять): 'создать резюме', 'конструктор резюме', 'AI карьерный помощник', 'советы по поиску работы'.
2. Структура: Введение, основная часть с практическими советами, заключение.
3. В конце добавьте мощный призыв к действию (CTA): предложите читателям за пару минут создать идеальное резюме на <a href="https://gethired.work">gethired.work</a>.`,
      userPrompt: `Тема: ${topic}\nСпецифические требования: ${requirements}\n\nСгенерируйте JSON статьи на русском языке.`,
      temperature: 0.4,
      maxTokens: 2500,
      responseFormat: { type: "json_object" } as any,
    };

    // --- 3. UKRAINIAN CONTENT ---
    const ukPrompt = {
      systemPrompt: `Ви — експерт з кар'єрного консультування та професійний SEO-копірайтер для сервісу "gethired.work" (AI-конструктор резюме). 
Напишіть цікаву, корисну та SEO-оптимізовану статтю для блогу українською мовою.

Вимоги до формату:
1. Результат МАЄ БУТИ валідним JSON об'єктом у такому форматі: {"title": "...", "excerpt": "...", "body": "..."}
2. "excerpt" — це короткий опис статті на 2-3 речення (для SEO мета-тегів).
3. "body" має містити чистий, валідний HTML. Використовуйте <h2> для головних розділів, <h3> для підрозділів, <p> для абзаців та <ul>/<li> для списків.
4. НЕ використовуйте Markdown (зірочки, решітки). Тільки HTML-теги.
5. НЕ використовуйте тег <h1> всередині "body".

Вимоги до контенту:
1. Органічно впишіть ключові слова: 'створити резюме', 'конструктор резюме', 'AI кар'єрний помічник', 'поради щодо пошуку роботи'.
2. Структура: Вступ, основна частина з практичними порадами, висновок.
3. Наприкінці додайте заклик до дії (CTA): запропонуйте читачам за кілька хвилин створити ідеальне резюме на <a href="https://gethired.work">gethired.work</a>.`,
      userPrompt: `Тема: ${topic}\nСпецифічні вимоги: ${requirements}\n\nЗгенеруйте JSON статті українською мовою.`,
      temperature: 0.4,
      maxTokens: 2500,
      responseFormat: { type: "json_object" } as any,
    };

    // Parallel execution for faster response
    const [enRes, ruRes, ukRes] = await Promise.all([
      aiComplete(enPrompt, session.user?.id),
      aiComplete(ruPrompt, session.user?.id),
      aiComplete(ukPrompt, session.user?.id),
    ]);

    // Helper to safely parse AI JSON response
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
          body: `<p>${resContent}</p>`, // Fallback if AI forgets JSON formatting
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
