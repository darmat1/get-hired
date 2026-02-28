import { getPostBySlug } from "@/lib/actions/blog";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import type { Language } from "@/lib/translations";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Metadata } from "next";
import Script from "next/script";

const SUPABASE_STORAGE_HOST = "nqxpyxpqgdzpoasqexcm.supabase.co";

function replaceImageUrl(url: string | null): string | null {
  if (!url) return null;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gethired.work";
  const path = url.replace(`https://${SUPABASE_STORAGE_HOST}/storage/`, "/storage/");
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
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
      </article>
    </>
  );
}
