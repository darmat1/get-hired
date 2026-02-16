import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/i18n-config";

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = getBaseUrl().replace(/\/$/, "");

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
