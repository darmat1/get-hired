import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/i18n-config";

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = getBaseUrl().replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/uk/dashboard/",
          "/ru/dashboard/",
          "/auth/",
          "/*_next/",
          "/*?*",
        ],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User"],
        allow: ["/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
