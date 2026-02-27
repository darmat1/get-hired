import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { headers, cookies } from "next/headers";
import type { Language } from "@/lib/translations";
import { Header } from "@/components/layout/header";

export default async function BlogListPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  const headerList = await headers();
  const cookieStore = await cookies();
  const locale = (headerList.get("x-locale") ||
    cookieStore.get("NEXT_LOCALE")?.value ||
    "en") as Language;

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-12">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => {
            const content =
              (post.content as any)[locale] || (post.content as any)["en"];
            if (!content) return null;

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {content.title}
                </h2>
                <div className="text-slate-500 dark:text-slate-400 text-sm">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </Link>
            );
          })}
        </div>
        {posts.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400">No posts yet.</p>
        )}
      </div>
    </>
  );
}
