import { getCachedPostsPage } from "@/lib/actions/blog";
import Link from "next/link";
import { headers, cookies } from "next/headers";
import type { Language } from "@/lib/translations";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import Image from "next/image";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const locale = headerList.get("x-locale") || "en";
  const path = "/blog";
  const canonical = locale === "en" ? path : `/${locale}${path}`;

  return {
    title: "Blog | GetHired - Career Tips, Resume Guides & AI Tools",
    description:
      "Read the latest career advice, resume tips, and AI tools guides on the GetHired blog. Expert tips on job hunting, interviews, and career growth.",
    alternates: {
      canonical,
      languages: {
        "en-US": "/blog",
        "uk-UA": "/uk/blog",
        "ru-RU": "/ru/blog",
        "x-default": "/blog",
      },
    },
    openGraph: {
      url: canonical,
    },
  };
}

export const revalidate = 3600;

const POSTS_PER_PAGE = 10;

const SUPABASE_STORAGE_HOST = "nqxpyxpqgdzpoasqexcm.supabase.co";

function replaceImageUrl(url: string | null): string | null {
  if (!url) return null;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gethired.work";
  const path = url.replace(
    `https://${SUPABASE_STORAGE_HOST}/storage/`,
    "/storage/",
  );
  return `${siteUrl}${path}`;
}

export default async function BlogListPage() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const locale = (headerList.get("x-locale") ||
    cookieStore.get("NEXT_LOCALE")?.value ||
    "en") as Language;

  const { posts, totalCount } = await getCachedPostsPage(0, POSTS_PER_PAGE);
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
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
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-400 transition">
                  {content.title}
                </h2>
                {excerpt && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                    {excerpt}
                  </p>
                )}
                <div className="text-slate-500 dark:text-slate-400 text-sm">
                  {new Date(post.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </Link>
            );
          })}
        </div>
        {posts.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400">No posts yet.</p>
        )}

        {/* {totalPages > 1 && (
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
        )} */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {/* Previous — задизейблен на первой странице */}
            <span className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 pointer-events-none">
              ‹
            </span>

            {/* Page numbers */}
            {(() => {
              const currentPage = 1;
              const pages: (number | "...")[] = [];

              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (currentPage > 3) pages.push("...");
                for (
                  let i = Math.max(2, currentPage - 1);
                  i <= Math.min(totalPages - 1, currentPage + 1);
                  i++
                ) {
                  pages.push(i);
                }
                if (currentPage < totalPages - 2) pages.push("...");
                pages.push(totalPages);
              }

              return pages.map((p, i) =>
                p === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500"
                  >
                    …
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={p === 1 ? "/blog" : `/blog/page/${p}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition
              ${
                p === currentPage
                  ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
                  >
                    {p}
                  </Link>
                ),
              );
            })()}

            {/* Next */}
            <Link
              href="/blog/page/2"
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              ›
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
