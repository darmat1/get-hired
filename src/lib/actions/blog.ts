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
