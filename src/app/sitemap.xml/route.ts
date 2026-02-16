import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/i18n-config";

const SITE_URL = getBaseUrl();
const locales = ["en", "uk", "ru"];
const pages = [
  "/",
  "/ai",
  "/pricing",
  "/linkedin-import",
  "/cover-letter",
  "/privacy-policy",
  "/terms-of-service",
];

function urlFor(loc: string, path: string) {
  if (loc === "en") return `${SITE_URL}${path === "/" ? "" : path}`;
  return `${SITE_URL}/${loc}${path === "/" ? "" : path}`;
}

export async function GET() {
  const lastmod = new Date().toISOString();

  const urlEntries = pages
    .flatMap((path) =>
      locales.map((currentLoc) => {
        const alternates = locales
          .map(
            (altLoc) =>
              `    <xhtml:link rel="alternate" hreflang="${altLoc}" href="${urlFor(altLoc, path)}"/>`,
          )
          .join("\n");

        const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor("en", path)}"/>`;

        return `
  <url>
    <loc>${urlFor(currentLoc, path)}</loc>
    <lastmod>${lastmod}</lastmod>
${alternates}
${xDefault}
  </url>`;
      }),
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
    },
  });
}
