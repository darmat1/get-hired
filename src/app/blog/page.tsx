import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { headers, cookies } from "next/headers";
import type { Language } from "@/lib/translations";
import { Header } from "@/components/layout/header";
import Image from "next/image";

const POSTS_PER_PAGE = 10;

const SUPABASE_STORAGE_HOST = "nqxpyxpqgdzpoasqexcm.supabase.co";

function replaceImageUrl(url: string | null): string | null {
  if (!url) return null;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gethired.work";
  const path = url.replace(`https://${SUPABASE_STORAGE_HOST}/storage/`, "/storage/");
  return `${siteUrl}${path}`;
}

export default async function BlogListPage() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const locale = (headerList.get("x-locale") ||
    cookieStore.get("NEXT_LOCALE")?.value ||
    "en") as Language;

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: POSTS_PER_PAGE,
  });

  const totalCount = await prisma.post.count({ where: { published: true } });
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

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

            const bodyHtml = (content as any).body || "";
            const plain = bodyHtml
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim();
            const excerpt =
              (content as any).excerpt ||
              (plain
                ? plain.slice(0, 140) + (plain.length > 140 ? "…" : "")
                : "");

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition no-underline hover:no-underline"
              >
                {(post as any).imageUrl && (
                  <Image
                    src={(post as any).imageUrl}
                    alt={content.title}
                    className="w-full h-40 object-cover rounded mb-3"
                    width={542}
                    height={160}
                    loading="lazy"
                  />
                )}
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {content.title}
                </h2>
                {excerpt && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                    {excerpt}
                  </p>
                )}
                <div className="text-slate-500 dark:text-slate-400 text-sm">
                  {new Date(post.createdAt).toISOString().slice(0, 10)}
                </div>
              </Link>
            );
          })}
        </div>
        {posts.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400">No posts yet.</p>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <span className="text-slate-500 dark:text-slate-400">
              Page 1 of {totalPages}
            </span>
            <Link
              href="/blog/page/2"
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
