import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * List connected providers
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Accessing aiCredential from custom generated client
    const [credentials, user] = await Promise.all([
      prisma.aiCredential.findMany({
        where: { userId: session.user.id },
        select: { provider: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { preferredAIProvider: true, preferredAIModel: true },
      }),
    ]);

    return NextResponse.json({
      connectedProviders: credentials.map((c) => c.provider),
      preferredAIProvider: user?.preferredAIProvider,
      preferredAIModel: user?.preferredAIModel,
    });
  } catch (error: any) {
    console.error("[AI Keys GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Save/Update an encrypted API key
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider, apiKey, isPreferred, model } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const encryptedKey = encrypt(apiKey);

    await prisma.$transaction(async (tx) => {
      // 1. Save or update the key
      await tx.aiCredential.upsert({
        where: {
          userId_provider: {
            userId: session.user.id,
            provider,
          },
        },
        create: {
          userId: session.user.id,
          provider,
          key: encryptedKey,
        },
        update: {
          key: encryptedKey,
        },
      });

      // 2. Set as preferred if requested
      if (isPreferred) {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            preferredAIProvider: provider,
            preferredAIModel: model || null,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[AI Keys Save Error]:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Delete an API key
 */
export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await req.json();

    if (!provider) {
      return NextResponse.json({ error: "Missing provider" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete the key
      await tx.aiCredential.delete({
        where: {
          userId_provider: {
            userId: session.user.id,
            provider,
          },
        },
      });

      // 2. Reset preference if it was this provider
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { preferredAIProvider: true },
      });

      if (user?.preferredAIProvider === provider) {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            preferredAIProvider: null,
            preferredAIModel: null,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[AI Keys Delete Error]:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Update preferences only
 */
export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { preferredAIProvider, preferredAIModel } = await req.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferredAIProvider: preferredAIProvider || null,
        preferredAIModel: preferredAIModel || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
