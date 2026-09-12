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

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // Auth validation - support CRON_SECRET or bearer token
    let token = "";
    let userId: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      const authValue = authHeader.split(" ")[1];
      if (cronSecret && authValue === cronSecret) {
        // Authenticated via CRON_SECRET, valid
      } else {
        token = authValue;
        try {
          const session = await auth.api.getSession({ headers: await headers() });
          userId = session?.user?.id;
        } catch {
          userId = undefined;
        }
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Конфигурация режима
    const subj = submolts[Math.floor(Math.random() * submolts.length)];
    
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

    // Сборка финального текста
    const finalContent =
      genPost.hook +
      "\n\n" +
      genPost.body +
      "\n\n" +
      genPost.conclusion;
      
    const postTitle = genPost.title;

    console.log("finalContent", finalContent);

    // 3. Отправка поста на Moltbook
    const postRes = await fetch(`${POST_API_BASE}/api/v1/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
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
          Authorization: token ? `Bearer ${token}` : "",
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
