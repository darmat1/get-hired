import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogAdminClient from "@/app/admin/blog/blog-admin-client";

export default async function BlogAdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const [posts, aiKeys] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.aiCredential.findMany({
      where: { userId: session.user.id },
      select: { provider: true },
    }),
  ]);

  const hasGeminiKey = aiKeys.some((k) => k.provider === "gemini");
  const hasOpenRouterKey = aiKeys.some((k) => k.provider === "openrouter");
  const hasGroqKey = aiKeys.some((k) => k.provider === "groq");

  return (
    <div className="w-full h-full py-8 px-8">
      <h1 className="text-3xl font-bold mb-8">Blog Administration</h1>
      <BlogAdminClient
        initialPosts={posts}
        hasGeminiKey={hasGeminiKey}
        hasOpenRouterKey={hasOpenRouterKey}
        hasGroqKey={hasGroqKey}
      />
    </div>
  );
}
