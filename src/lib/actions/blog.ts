"use server";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";

const BLOG_TAG = "blog";

export async function createPost(data: {
  slug: string;
  content: any;
  imageUrl?: string;
  published?: boolean;
  relatedPostIds?: string[];
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role?.toLowerCase();
  if (!session || !["superadmin", "admin", "publisher"].includes(userRole)) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.create({
    data: {
      slug: data.slug,
      content: data.content,
      imageUrl: data.imageUrl,
      published: data.published ?? false,
      authorId: session.user.id,
      relatedPostIds: data.relatedPostIds ?? [],
    },
  });

  revalidatePath("/blog");
  revalidateTag(BLOG_TAG, "max");
  return post;
}

export async function getPosts() {
  return unstable_cache(
    () =>
      prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
      }),
    ["blog-posts-all"],
    { revalidate: 3600, tags: [BLOG_TAG] },
  )();
}

export async function getCachedPostsPage(skip: number, take: number) {
  return unstable_cache(
    async () => {
      const [posts, totalCount] = await Promise.all([
        prisma.post.findMany({
          where: { published: true },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.post.count({ where: { published: true } }),
      ]);
      return { posts, totalCount };
    },
    ["blog-posts-page", String(skip), String(take)],
    { revalidate: 3600, tags: [BLOG_TAG] },
  )();
}

export const getPostBySlug = cache(async (slug: string) => {
  return unstable_cache(
    () => prisma.post.findUnique({ where: { slug } }),
    ["blog-post", slug],
    { revalidate: 3600, tags: [BLOG_TAG] },
  )();
});

export async function updatePost(
  id: string,
  data: {
    slug: string;
    content: any;
    imageUrl?: string;
    published?: boolean;
    relatedPostIds?: string[];
  },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role?.toLowerCase();
  if (!session || !["superadmin", "admin", "publisher"].includes(userRole)) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      slug: data.slug,
      content: data.content,
      imageUrl: data.imageUrl,
      published: data.published,
      relatedPostIds: data.relatedPostIds ?? [],
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  revalidateTag(BLOG_TAG, "max");
  return post;
}

export async function deletePost(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await prisma.post.delete({
    where: { id },
  });

  revalidatePath("/blog");
  revalidateTag(BLOG_TAG, "max");
}

export async function getNextPendingPost() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role?.toLowerCase();
  if (!session || !["superadmin", "admin", "publisher"].includes(userRole)) {
    throw new Error("Unauthorized");
  }

  try {
    const fs = require("fs");
    const path = require("path");
    const postsJsonPath = path.join(process.cwd(), "posts.json");

    if (!fs.existsSync(postsJsonPath)) {
      return { error: "posts.json not found" };
    }

    const fileContent = fs.readFileSync(postsJsonPath, "utf-8");
    const blogTopics = JSON.parse(fileContent);

    const existingPosts = await prisma.post.findMany({
      select: { slug: true },
    });
    const existingSlugs = new Set(existingPosts.map((p) => p.slug));

    const nextPost = blogTopics.find(
      (topic: any) => !existingSlugs.has(topic.slug),
    );

    return { nextPost: nextPost || null };
  } catch (error) {
    console.error("Error reading posts.json:", error);
    return { error: "Failed to read posts.json" };
  }
}

export async function publishToBlogger(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role?.toLowerCase();
  if (!session || !["superadmin", "admin"].includes(userRole)) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) throw new Error("Post not found");

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
  const BLOGGER_BLOG_ID = process.env.BLOGGER_BLOG_ID;

  if (
    !GOOGLE_CLIENT_ID ||
    !GOOGLE_CLIENT_SECRET ||
    !GOOGLE_REFRESH_TOKEN ||
    !BLOGGER_BLOG_ID
  ) {
    throw new Error("Missing Blogger configuration in environment variables");
  }

  // 1. Get Access Token from Refresh Token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    console.error("Token error:", tokenData);
    throw new Error("Failed to refresh Google access token");
  }

  const accessToken = tokenData.access_token;

  // 2. Prepare content (English version)
  const content = post.content as any;
  const title = content.en?.title || "Untitled";
  let body = content.en?.body || "";

  // 3. Transform image URLs in body if they match internal storage
  if (post.imageUrl) {
    const filename = post.imageUrl.split("/").pop();
    const cdnImageUrl = `https://gethired.work/storage/v1/object/public/blog/${filename}`;
    
    // If post has an image, we can prepend it to the body for Blogger
    body = `<img src="${cdnImageUrl}" alt="${title}" style="width:100%; max-width:800px; height:auto; display:block; margin: 0 auto 20px;" />\n${body}`;
  }

  // 4. Add link to original post
  const originalUrl = `https://gethired.work/blog/${post.slug}`;
  body += `<br/><br/><hr/><p>Original post: <a href="${originalUrl}">${originalUrl}</a></p>`;

  // 5. Publish to Blogger
  const bloggerResponse = await fetch(
    `https://www.googleapis.com/blogger/v3/blogs/${BLOGGER_BLOG_ID}/posts/?isDraft=false`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: "blogger#post",
        title: title,
        content: body,
      }),
    }
  );

  const result = await bloggerResponse.json();
  if (result.error) {
    console.error("Blogger API error:", result.error);
    throw new Error(result.error.message || "Failed to publish to Blogger");
  }

  return { success: true, url: result.url };
}

export async function checkBlogPostsJsonExists() {
  try {
    const fs = require("fs");
    const path = require("path");
    const postsJsonPath = path.join(process.cwd(), "posts.json");
    return fs.existsSync(postsJsonPath);
  } catch (error) {
    console.error("Error checking posts.json existence:", error);
    return false;
  }
}
