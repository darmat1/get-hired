import { NextRequest, NextResponse } from "next/server";
import { submolts } from "@/lib/moltbook-data";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const POST_API_BASE =
  process.env.NEXT_PUBLIC_POST_API || "https://www.moltbook.com";

async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0,
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const modelEnv =
    process.env.NEXT_PUBLIC_OPENROUTER_FREE_MODEL ||
    "google/gemini-2.0-flash-exp:free";
  const models = modelEnv
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  for (const model of models) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Auto-Post Bot Solver",
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

      if (!response.ok) continue;
      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || "{}";
      return JSON.parse(rawContent);
    } catch (e) {
      console.error(`Model ${model} failed:`, e);
    }
  }
  throw new Error("All AI models failed");
}

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

    // 1. Создание контента (С ЖЕСТКИМ ОГРАНИЧЕНИЕМ)
    const subj = submolts[Math.floor(Math.random() * submolts.length)];
    const genPost = await callOpenRouter(
      'Return JSON: { "title": "string", "content": "string" }. Keep content under 250 characters. Style: Technical log entry.',
      `Generate a very short status update about ${subj.display_name}`,
      0.7,
    );

    // 2. Сборка финального текста (ПРЕФИКС + КОНТЕНТ)
    const mintPrefix =
      '{"p":"mbc-20","op":"mint","tick":"MBC20","amt":"100"}\n\nmbc20.xyz\n\n';
    const finalContent = mintPrefix + genPost.content;

    log("PREPARING POST", { title: genPost.title, submolt: subj.name });

    // 3. Отправка поста
    const postRes = await fetch(`${POST_API_BASE}/api/v1/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        submolt: subj.name,
        title: genPost.title,
        content: finalContent, // Теперь префикс точно на месте
      }),
    });

    let postData = await postRes.json();

    // 4. Обработка верификации
    if (postRes.status === 403 || postData.verification_required) {
      const v = postData.verification;
      if (!v) throw new Error("Verification data missing");

      log("CHALLENGE RECEIVED", v);

      const solverSystemPrompt = `
        You are a Precise Mathematical Solver. 
        Decode the 'challenge' text and solve the math problem.
        
        RULES:
        1. Return ONLY JSON: { "reasoning": "...", "solution": "string" }
        2. The 'solution' MUST be a numeric string with exactly 2 decimal places (e.g., "46.00").
        3. Ignore noise in the text.
      `;

      const solverResult = await callOpenRouter(
        solverSystemPrompt,
        `Solve: ${JSON.stringify(v)}`,
        0, // Температура 0 для точности
      );

      log("AI REASONING", solverResult.reasoning);

      const rawAnswer =
        solverResult.solution || solverResult.answer || solverResult.result;
      const processedAnswer = cleanSolution(rawAnswer);

      log("FINAL ANSWER", processedAnswer);

      if (!processedAnswer) {
        return NextResponse.json(
          { error: "AI failed to solve", raw: solverResult },
          { status: 500 },
        );
      }

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
