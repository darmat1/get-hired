import { NextRequest, NextResponse } from "next/server";
import { submolts } from "@/lib/moltbook-data";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";
const POST_API_BASE =
  process.env.NEXT_PUBLIC_POST_API || "https://www.moltbook.com";

async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.1,
): Promise<any> {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY missing");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: temperature,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Groq API Error: ${txt}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "{}";

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const cleanJSON = jsonMatch ? jsonMatch[0] : raw;
    return JSON.parse(cleanJSON);
  } catch (e) {
    console.error("JSON PARSE ERROR. Raw content:", raw);
    throw new Error(`Invalid JSON from AI: ${raw}`);
  }
}

export async function GET(req: NextRequest) {
  const requestStart = Date.now();
  const log = (msg: string, data?: any) => {
    console.log(
      `[auto-post +${Date.now() - requestStart}ms] ${msg}`,
      data ? JSON.stringify(data).slice(0, 200) : "",
    );
  };

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.split(" ")[1];

    const subj = submolts[Math.floor(Math.random() * submolts.length)];
    const postPrompt = `Generate a short status update for an AI network. 
    Topic: ${subj.display_name}. Style: Technical log, concise. 
    Output JSON: { "title": "str", "content": "str" }`;

    const genPost = await callGroq(postPrompt, "Generate status.", 0.7);
    const finalContent =
      '{"p":"mbc-20","op":"transfer","tick":"CLAW","amt":"100","to":"0x53454C46"}\n\nmbc20.xyz\n\n' +
      genPost.content;

    // log("Posting...");
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

    // 4. Verification Logic (Universal Solver)
    if (postRes.status === 403 || postData.verification_required) {
      const { challenge, instructions, code } = postData.verification || {};
      if (!challenge) throw new Error("No challenge data");

      // log("Solving challenge (Universal Mode)...");

      // === УНИВЕРСАЛЬНЫЙ СИСТЕМНЫЙ ПРОМПТ ===
      const solverSystemPrompt = `
        You are a Generalized Puzzle Solver AI. 
        Your goal is to pass a CAPTCHA/Verification challenge.

        PROTOCOL:
        1. **Analyze Instructions First**: Determine what creates the answer (Math? Counting characters? Phonetic decoding? General knowledge?).
        2. **Analyze Challenge Text**: Apply the logic from step 1 to the challenge text.
        3. **Formatting**:
           - If the answer is a NUMBER: You MUST format it with 2 decimal places (e.g. 5 -> "5.00", 12.5 -> "12.50"), unless told otherwise.
           - If the answer is TEXT: Keep it clean.
        
        OUTPUT JSON STRUCTURE:
        {
          "puzzle_type": "Briefly describe the type (e.g. 'Phonetic Math' or 'Character Counting')",
          "reasoning": "Explain your logic step-by-step here.",
          "solution": "THE FINAL EXACT ANSWER ONLY"
        }
      `;

      const solverUserPrompt = `
        INSTRUCTIONS: ${instructions}
        
        CHALLENGE TEXT:
        "${challenge}"
        
        Solve this. Return ONLY the JSON.
      `;

      // Решаем задачу (1 попытка)
      const solverResult = await callGroq(
        solverSystemPrompt,
        solverUserPrompt,
        0.1,
      );

      // log("AI Logic:", {
      //   type: solverResult.puzzle_type,
      //   reasoning: solverResult.reasoning,
      // });
      // log("Sending Answer:", solverResult.solution);

      const verifyRes = await fetch(`${POST_API_BASE}/api/v1/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verification_code: code,
          answer: solverResult.solution,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        // log("Verification FAILED", verifyData);

        return NextResponse.json(
          {
            error: "Verification failed",
            ai_thought: solverResult.reasoning,
            server_hint: verifyData.hint,
          },
          { status: 403 },
        );
      }

      // log("Verification SUCCESS");
      postData = verifyData;
    }

    return NextResponse.json({ success: true, post: postData });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
}
