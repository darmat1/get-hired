import { getPostBySlug } from "@/lib/actions/blog";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import type { Language } from "@/lib/translations";
import Image from "next/image";
import { Header } from "@/components/layout/header";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const headerList = await headers();
  const cookieStore = await cookies();
  const locale = (headerList.get("x-locale") ||
    cookieStore.get("NEXT_LOCALE")?.value ||
    "en") as Language;

  const content = (post.content as any)[locale] || (post.content as any)["en"];

  const slugToTitle = (s: string) =>
    s
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  const headerTitle = content?.title ?? slugToTitle(slug);

  if (!content) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4">
        <h1 className="text-2xl font-bold">
          Content not available in your language
        </h1>
      </div>
    );
  }

  return (
    <>
      <Header />
      <article className="max-w-3xl mx-auto py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight leading-tight text-slate-900 dark:text-white">
          {headerTitle}
        </h1>

        {post.imageUrl && (
          <div className="relative w-full mb-12 overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt={headerTitle}
              className="w-full h-auto max-h-[600px] object-cover"
            />
          </div>
        )}
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </article>
    </>
  );
}
