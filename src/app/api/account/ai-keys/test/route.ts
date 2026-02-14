import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { testAIService } from "@/lib/ai-services";

/**
 * Ephemeral test for AI API keys from the client.
 * Does NOT save anything to the database.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Missing provider or apiKey" },
        { status: 400 },
      );
    }

    // Attempt a lightweight test call
    const isValid = await testAIService({
      id: provider,
      name: provider,
      apiKey,
    });

    return NextResponse.json({ success: isValid });
  } catch (error: any) {
    console.error(`[AI Test API Error]:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
