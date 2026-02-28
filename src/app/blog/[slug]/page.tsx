import { getPostBySlug } from "@/lib/actions/blog";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import type { Language } from "@/lib/translations";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Metadata } from "next";
import Script from "next/script";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Blog" };
  }

  const headerList = await headers();
  const cookieStore = await cookies();
  const locale = (headerList.get("x-locale") ||
    cookieStore.get("NEXT_LOCALE")?.value ||
    "en") as Language;

  const content = (post.content as any)[locale] || (post.content as any)["en"];
  const title = content?.title || slug;
  const excerpt = content?.excerpt || "";

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gethired.work";
  const imageUrl = replaceImageUrl(post.imageUrl);

  return {
    title,
    description: excerpt,
    alternates: {
      canonical: `${siteUrl}/blog/${slug}`,
      languages: {
        en: `${siteUrl}/blog/${slug}`,
        uk: `${siteUrl}/uk/blog/${slug}`,
        ru: `${siteUrl}/ru/blog/${slug}`,
        "x-default": `${siteUrl}/blog/${slug}`,
      },
    },
    openGraph: {
      title,
      description: excerpt,
      type: "article",
      url: `${siteUrl}/blog/${slug}`,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: excerpt,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

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
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gethired.work";

  const title = content?.title || slug;
  const excerpt = content?.excerpt || "";
  const imageUrl = replaceImageUrl(post.imageUrl);

  const slugToTitle = (s: string) =>
    s
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  const headerTitle = content?.title ?? slugToTitle(slug);

  // Fetch related posts if any
  const relatedPostIds = (post as any).relatedPostIds as string[] | undefined;
  const relatedPosts =
    relatedPostIds && relatedPostIds.length > 0
      ? await prisma.post.findMany({
          where: {
            id: { in: relatedPostIds },
            published: true,
          },
        })
      : [];

  // Preserve order from relatedPostIds
  const orderedRelated = relatedPostIds
    ? relatedPostIds
        .map((id) => relatedPosts.find((p) => p.id === id))
        .filter(Boolean)
    : [];

  // Locale-aware blog link prefix
  const localeBlogPrefix = locale === "en" ? "/blog" : `/${locale}/blog`;

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
      <Script
        id="blog-posting-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: title,
            description: excerpt,
            image: imageUrl || undefined,
            datePublished: post.createdAt.toISOString(),
            dateModified:
              post.updatedAt?.toISOString() || post.createdAt.toISOString(),
            author: {
              "@type": "Organization",
              name: "GetHired",
              url: siteUrl,
            },
            publisher: {
              "@type": "Organization",
              name: "GetHired",
              logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/logo.png`,
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${siteUrl}/blog/${slug}`,
            },
          }),
        }}
      />
      <article className="max-w-3xl mx-auto py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight leading-tight text-slate-900 dark:text-white">
          {headerTitle}
        </h1>

        {post.imageUrl && (
          <div className="relative w-full mb-12 overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
            <Image
              src={post.imageUrl}
              alt={headerTitle}
              className="w-full h-auto max-h-[600px] object-cover"
              width={734}
              height={412}
              loading="lazy"
            />
          </div>
        )}

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />

        {/* Related Posts */}
        {orderedRelated.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              {locale === "ru"
                ? "Читайте также"
                : locale === "uk"
                  ? "Читайте також"
                  : "Related Articles"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {orderedRelated.map((relatedPost) => {
                if (!relatedPost) return null;
                const relatedContent =
                  (relatedPost.content as any)[locale] ||
                  (relatedPost.content as any)["en"];
                if (!relatedContent) return null;

                const relatedTitle = relatedContent.title || relatedPost.slug;
                const relatedExcerpt = relatedContent.excerpt || "";

                return (
                  <Link
                    key={relatedPost.id}
                    href={`${localeBlogPrefix}/${relatedPost.slug}`}
                    className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition no-underline"
                  >
                    {(relatedPost as any).imageUrl ? (
                      <div className="relative w-full h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <Image
                          src={(relatedPost as any).imageUrl}
                          alt={relatedTitle}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, 50vw"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                        <svg
                          className="w-10 h-10 text-slate-300 dark:text-slate-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2 mb-2">
                        {relatedTitle}
                      </h3>
                      {relatedExcerpt && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {relatedExcerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
