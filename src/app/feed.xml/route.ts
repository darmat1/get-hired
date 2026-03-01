import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gethired.work";
const SUPABASE_STORAGE_HOST = "nqxpyxpqgdzpoasqexcm.supabase.co";

export const revalidate = 3600;

function replaceImageUrl(url: string | null): string | null {
  if (!url) return null;
  const path = url.replace(
    `https://${SUPABASE_STORAGE_HOST}/storage/`,
    "/storage/",
  );
  return `${BASE_URL}${path}`;
}

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const items = posts
    .map((post) => {
      const content =
        (post.content as any)?.en ||
        (post.content as any)?.ru ||
        (post.content as any)?.uk;
      if (!content) return null;

      const title = content.title || post.slug;
      const excerpt = (content.excerpt || "").slice(0, 220);
      const url = `${BASE_URL}/blog/${post.slug}`;
      const pubDate = new Date(post.createdAt).toUTCString();
      const imageUrl = replaceImageUrl((post as any).imageUrl || null);

      return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${excerpt}]]></description>
      ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" length="0"/>` : ""}
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .filter(Boolean)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>GetHired.work Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Career tips, resume guides and AI tools for job seekers.</description>
    <language>en</language>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
