import { NextRequest, NextResponse } from "next/server";
import { submolts } from "@/lib/moltbook-data";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const POST_API_BASE =
  process.env.NEXT_PUBLIC_POST_API || "https://www.moltbook.com";

/**
 * Функция вызова Groq API
 */
async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0,
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey)
    throw new Error("GROQ_API_KEY is missing in environment variables");

  // llama-3.3-7b-specdec — очень быстрая и точная модель
  const model = "llama-3.3-70b-versatile";

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: temperature,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";
    return JSON.parse(rawContent);
  } catch (e: any) {
    console.error(`[Groq Error]:`, e.message);
    throw e;
  }
}

/**
 * Форматирование ответа: строго число с 2 знаками после запятой
 */
function cleanSolution(val: any): string | null {
  if (val === undefined || val === null || val === "") return null;
  const cleanStr = String(val).replace(/[^\d.-]/g, "");
  const num = parseFloat(cleanStr);
  if (isNaN(num)) return null;
  return num.toFixed(2);
}

export async function GET(req: NextRequest) {
  const requestStart = Date.now();
  const log = (label: string, data?: any) => {
    const time = `[${Date.now() - requestStart}ms]`;
    console.log(
      `${time} ${label}:`,
      typeof data === "object" ? JSON.stringify(data, null, 2) : data,
    );
  };

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.split(" ")[1];

    // 1. Генерация контента поста
    const subj = submolts[Math.floor(Math.random() * submolts.length)];
    const genPost = await callGroq(
      'Return JSON: { "title": "string", "content": "string" }. Content must be under 150 characters.',
      `Generate a very short technical status update about ${subj.display_name}`,
      0.7,
    );

    // 2. Сборка финального текста с МИНТ-ПРЕФИКСОМ
    const mintPrefix =
      '{"p":"mbc-20","op":"mint","tick":"GPT","amt":"100"}\n\nmbc20.xyz\n\n';
    const finalContent = mintPrefix + genPost.content;

    log("PREPARING POST", { title: genPost.title, submolt: subj.name });

    // 3. Отправка поста на Moltbook
    const postRes = await fetch(`${POST_API_BASE}/api/v1/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        submolt: subj.name,
        title: genPost.title,
        content: finalContent,
      }),
    });

    let postData = await postRes.json();

    // 4. Если требуется верификация (Captcha)
    if (postRes.status === 403 || postData.verification_required) {
      const v = postData.verification;
      if (!v) throw new Error("Verification data missing from server response");

      log("CHALLENGE RECEIVED", v);

      const solverSystemPrompt = `
        You are a Precise Mathematical Solver. 
        Decode the 'challenge' text and solve the math problem.
        
        RULES:
        1. Return ONLY JSON: { "reasoning": "step by step logic", "solution": "string" }
        2. The 'solution' MUST be a numeric string with exactly 2 decimal places (e.g., "46.00").
        3. Ignore noise characters and strange casing.
      `;

      const solverResult = await callGroq(
        solverSystemPrompt,
        `Solve this challenge: ${JSON.stringify(v)}`,
        0, // Температура 0 для максимальной точности в математике
      );

      log("AI REASONING", solverResult.reasoning);

      // Извлекаем ответ, проверяя разные ключи
      const rawAnswer =
        solverResult.solution || solverResult.answer || solverResult.result;
      const processedAnswer = cleanSolution(rawAnswer);

      log("FINAL FORMATTED ANSWER", processedAnswer);

      if (!processedAnswer) {
        return NextResponse.json(
          {
            error: "AI failed to provide a numeric solution",
            raw_ai_response: solverResult,
          },
          { status: 500 },
        );
      }

      // 5. Отправка решения капчи
      const verifyRes = await fetch(`${POST_API_BASE}/api/v1/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verification_code: v.code,
          answer: processedAnswer,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        log("VERIFICATION FAILED", verifyData);
        return NextResponse.json(
          {
            error: "Verification failed",
            ai_logic: solverResult.reasoning,
            answer_sent: processedAnswer,
            server_response: verifyData,
          },
          { status: 403 },
        );
      }

      log("VERIFICATION SUCCESSFUL");
      postData = verifyData;
    }

    return NextResponse.json({ success: true, post: postData });
  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
