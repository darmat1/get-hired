import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { submolts } from "@/lib/moltbook-data";
import {
  buildAutoPostGenerationPrompt,
  buildAutoPostVerificationPrompt,
} from "@/lib/ai/prompts/auto-post";
import { executeStructuredAI } from "@/lib/ai/structured-output";

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
      const generationPrompt = buildAutoPostGenerationPrompt(subj.display_name);
      const genResponse = await executeStructuredAI<{
        title: string;
        hook: string;
        body: string;
        conclusion: string;
      }>(
        {
          systemPrompt: generationPrompt.systemPrompt,
          userPrompt: generationPrompt.userPrompt,
          temperature: 0.7,
        },
        userId,
      );

      const genPost = genResponse.parsed;

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

      const verificationPrompt = buildAutoPostVerificationPrompt(
        JSON.stringify(v),
      );

      const solverResponse = await executeStructuredAI<{
        reasoning?: string;
        solution?: string;
        answer?: string;
        result?: string;
      }>({
        systemPrompt: verificationPrompt.systemPrompt,
        userPrompt: verificationPrompt.userPrompt,
        temperature: 0,
      });

      const solverResult = solverResponse.parsed;

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
