import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gethired.work";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["en", "uk", "ru"];
  const defaultLocale = "en";
  const staticLastMod = new Date("2026-02-27");
  const staticRoutes = [
    "",
    "/ai",
    "/pricing",
    "/linkedin-import",
    "/cover-letter",
    "/resume-builder",
    "/blog",
    "/privacy-policy",
    "/terms-of-service",
  ];

  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const getUrl = (path: string, locale: string) => {
    if (locale === defaultLocale) {
      return `${BASE_URL}${path}`;
    }
    return `${BASE_URL}/${locale}${path}`;
  };

  const staticEntries = staticRoutes.flatMap((route) => {
    return locales.map((locale) => {
      const alternates = locales.reduce(
        (acc, loc) => {
          acc[loc] = getUrl(route, loc);
          return acc;
        },
        {} as Record<string, string>,
      );

      return {
        url: getUrl(route, locale),
        lastModified: staticLastMod,
        changeFrequency: "monthly" as const,
        priority: route === "" ? 1 : 0.8,
        alternates: {
          languages: alternates,
        },
      };
    });
  });

  const blogEntries = posts.flatMap((post) => {
    const route = `/blog/${post.slug}`;

    return locales.map((locale) => {
      const alternates = locales.reduce(
        (acc, loc) => {
          acc[loc] = getUrl(route, loc);
          return acc;
        },
        {} as Record<string, string>,
      );

      return {
        url: getUrl(route, locale),
        lastModified: post.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: {
          languages: alternates,
        },
      };
    });
  });

  return [...staticEntries, ...blogEntries];
}
