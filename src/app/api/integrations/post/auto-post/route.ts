import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { submolts } from "@/lib/moltbook-data";
import { aiComplete } from "@/lib/ai/server-ai";

const POST_API_BASE =
  process.env.NEXT_PUBLIC_POST_API || "https://www.moltbook.com";

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
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.split(" ")[1];

    // 1. Конфигурация режима
    const mode = process.env.AUTO_POST_MODE || "ai";
    const mintCurrRaw = process.env.MINT_CURR || "GPT";
    const mintAmtRaw = process.env.MINT_AMT || "100";

    const tickers = mintCurrRaw.split(",").map((t) => t.trim());
    const amounts = mintAmtRaw.split(",").map((a) => a.trim());

    const inscriptions = tickers
      .map((tick, i) => {
        const amt = amounts[i] || amounts[amounts.length - 1];
        return `{"p":"mbc-20","op":"mint","tick":"${tick}","amt":"${amt}"}`;
      })
      .join(" ");

    let subj;
    let postTitle;
    let finalContent;

    if (mode === "mint") {
      // Режим минта: строго в general
      subj = submolts.find((s) => s.name === "general") || submolts[0];
      postTitle = `${mintCurrRaw} minting`;
      finalContent = `${inscriptions} mbc20.xyz`;
    } else {
      // Режим AI (как сейчас): рандомная ветка + генерация
      subj = submolts[Math.floor(Math.random() * submolts.length)];
      // Получаем userId активного пользователя (если есть)
      let userId: string | undefined;
      try {
        const session = await auth.api.getSession({ headers: await headers() });
        userId = session?.user?.id;
      } catch {
        userId = undefined;
      }
      const genResponse = await aiComplete(
        {
          systemPrompt:
            'Return JSON: { "title": "string", "hook": "string", "body": "string", conclusion: "string" }. Hook must be under 50 characters. Body must be under 300 characters but minimum 200 characters. Conclusion must be under 50 characters.',
          userPrompt: `Generate a technical status about ${subj.display_name}`,
          temperature: 0.7,
          responseFormat: { type: "json_object" },
        },
        userId,
      );

      const genPost = JSON.parse(genResponse.content);

      // Сборка финального текста с МИНТ-ПРЕФИКСОМ
      const mintPrefix = `${inscriptions}mbc20.xyz\n\n`;
      finalContent =
        genPost.hook +
        "\n\n" +
        genPost.body +
        "\n\n" +
        mintPrefix +
        genPost.conclusion;
      postTitle = genPost.title;
    }

    console.log("finalContent", finalContent);

    // 3. Отправка поста на Moltbook
    const postRes = await fetch(`${POST_API_BASE}/api/v1/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        submolt: subj.name,
        title: postTitle,
        content: finalContent,
      }),
    });

    let postData = await postRes.json();

    // 4. Если требуется верификация (Captcha)
    if (postRes.status === 403 || postData.verification_required) {
      const v = postData.verification;
      if (!v) throw new Error("Verification data missing from server response");

      const solverSystemPrompt = `
        You are a Precise Mathematical Solver. 
        Your task is to extract a math problem from a noisy text and solve it.

        CRITICAL RULES:
        1. IGNORE "lO", "l0", "O", or "o" if they are part of words like "lO bStErS" or "lO.oBsT". These are NOT numbers.
        2. ONLY look for numbers written as words (e.g., "twenty three", "seven") or clear digits.
        3. Identify the specific values associated with the question (e.g., "claw exerts X", "tail adds Y").
        4. IGNORE all flavor text and focus ONLY on the values that contribute to the final "total".
        5. Return ONLY JSON: { "reasoning": "...", "solution": "string" }
        6. The 'solution' MUST be a numeric string with exactly 2 decimal places (e.g., "30.00").
      `;

      const solverResponse = await aiComplete({
        systemPrompt: solverSystemPrompt,
        userPrompt: `Solve this challenge: ${JSON.stringify(v)}`,
        temperature: 0,
        responseFormat: { type: "json_object" },
      });

      const solverResult = JSON.parse(solverResponse.content);

      // Извлекаем ответ, проверяя разные ключи
      const rawAnswer =
        solverResult.solution || solverResult.answer || solverResult.result;
      const processedAnswer = cleanSolution(rawAnswer);

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

      postData = verifyData;
    }

    return NextResponse.json({ success: true, post: postData });
  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
