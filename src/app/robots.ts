import { MetadataRoute } from "next";
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gethired.work";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/uk/dashboard/",
          "/ru/dashboard/",
          "/auth/",
          "/_next/",
          "/*?*",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Claude-Webcheck",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
        ],
        allow: ["/", "/llms.txt"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
