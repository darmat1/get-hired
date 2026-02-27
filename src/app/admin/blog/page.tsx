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

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full h-full py-8 px-8">
      <h1 className="text-3xl font-bold mb-8">Blog Administration</h1>
      <BlogAdminClient initialPosts={posts} />
    </div>
  );
}
