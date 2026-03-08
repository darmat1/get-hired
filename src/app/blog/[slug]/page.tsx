// app/blog/[slug]/page.tsx
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
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getT } from "@/lib/translations-data";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return slugs.map((p) => ({ slug: p.slug }));
}

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

  if (!post) return { title: "Blog" };

  const headerList = await headers();
  const cookieStore = await cookies();
  const locale = (headerList.get("x-locale") ||
    cookieStore.get("NEXT_LOCALE")?.value ||
    "en") as Language;

  const content = (post.content as any)[locale] || (post.content as any)["en"];
  const title = content?.title || slug;
  const excerpt = content?.excerpt || "";
  const imageUrl = replaceImageUrl(post.imageUrl);
  const canonical =
    locale === "en" ? `/blog/${slug}` : `/${locale}/blog/${slug}`;

  return {
    title,
    description: excerpt,
    alternates: {
      canonical,
      languages: {
        en: `/blog/${slug}`,
        uk: `/uk/blog/${slug}`,
        ru: `/ru/blog/${slug}`,
        "x-default": `/blog/${slug}`,
      },
    },
    openGraph: {
      title,
      description: excerpt,
      type: "article",
      url: canonical,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: title }]
        : [],
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

  if (!post) notFound();

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
  const headerTitle =
    content?.title ??
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const relatedPostIds = (post as any).relatedPostIds as string[] | undefined;
  const relatedPosts =
    relatedPostIds && relatedPostIds.length > 0
      ? await prisma.post.findMany({
          where: { id: { in: relatedPostIds }, published: true },
        })
      : [];

  const orderedRelated = relatedPostIds
    ? relatedPostIds
        .map((id) => relatedPosts.find((p) => p.id === id))
        .filter(Boolean)
    : [];
  const localeBlogPrefix = locale === "en" ? "/blog" : `/${locale}/blog`;

  if (!content)
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold">Content not available</h1>
      </div>
    );

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
            datePublished: new Date(post.createdAt).toISOString(),
            dateModified: post.updatedAt
              ? new Date(post.updatedAt).toISOString()
              : new Date(post.createdAt).toISOString(),
            author: { "@type": "Organization", name: "GetHired", url: siteUrl },
            publisher: {
              "@type": "Organization",
              name: "GetHired",
              logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${siteUrl}/blog/${slug}`,
            },
          }),
        }}
      />
      <div className="max-w-7xl mx-auto pt-12 px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            {
              label: getT(locale)("nav.blog"),
              href: locale === "en" ? "/blog" : `/${locale}/blog`,
            },
            { label: headerTitle, href: "#" },
          ]}
        />
      </div>
      <article className="max-w-3xl mx-auto pb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight text-slate-900 dark:text-white">
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
              priority
            />
          </div>
        )}
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
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
              {orderedRelated.map((relatedPost: any) => {
                const relatedContent =
                  (relatedPost.content as any)[locale] ||
                  (relatedPost.content as any)["en"];
                if (!relatedContent) return null;
                return (
                  <Link
                    key={relatedPost.id}
                    href={`${localeBlogPrefix}/${relatedPost.slug}`}
                    className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition no-underline"
                  >
                    {relatedPost.imageUrl && (
                      <div className="relative w-full h-40 overflow-hidden bg-slate-100">
                        <Image
                          src={relatedPost.imageUrl}
                          alt={relatedContent.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="50vw"
                        />
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {relatedContent.title}
                      </h3>
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
