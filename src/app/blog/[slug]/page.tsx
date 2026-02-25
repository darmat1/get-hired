import { getPostBySlug } from "@/lib/actions/blog";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import type { Language } from "@/lib/translations";

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
    <article className="max-w-3xl mx-auto py-20 px-4">
      <h1 className="text-4xl font-bold mb-8">{content.title}</h1>
      <div
        className="prose prose-invert lg:prose-xl"
        dangerouslySetInnerHTML={{ __html: content.body }}
      />
    </article>
  );
}
