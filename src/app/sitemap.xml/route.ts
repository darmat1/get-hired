import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const locales = ["en", "uk", "ru"];
const pages = [
  "/",
  "/ai",
  "/pricing",
  "/templates",
  "/privacy-policy",
  "/terms-of-service",
];

function urlFor(loc: string, path: string) {
  if (loc === "en") return `${SITE_URL}${path}`;
  return `${SITE_URL}/${loc}${path === "/" ? "" : path}`;
}

export async function GET() {
  const lastmod = new Date().toISOString();

  const urls = pages
    .map((path) => {
      const alternates = locales
        .map(
          (loc) =>
            `    <xhtml:link rel="alternate" hreflang="${loc === "ua" ? "uk" : loc}" href="${urlFor(loc, path)}"/>`,
        )
        .join("\n");

      return `  <url>\n    <loc>${urlFor("en", path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
