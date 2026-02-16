export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gethired.work";

export async function GET() {
  const locales = ["en", "uk", "ru"];
  const pages = [
    "",
    "/ai",
    "/pricing",
    "/linkedin-import",
    "/cover-letter",
    "/privacy-policy",
    "/terms-of-service",
  ];
  const lastmod = new Date().toISOString();

  // Генерируем строки для каждой страницы и каждой локали
  const entries = pages
    .flatMap((path) => {
      return locales.map((loc) => {
        const currentUrl =
          loc === "en"
            ? `${SITE_URL}${path || "/"}`
            : `${SITE_URL}/${loc}${path}`;

        const alternates = locales
          .map((altLoc) => {
            const altUrl =
              altLoc === "en"
                ? `${SITE_URL}${path || "/"}`
                : `${SITE_URL}/${altLoc}${path}`;
            return `<xhtml:link rel="alternate" hreflang="${altLoc}" href="${altUrl}"/>`;
          })
          .join("");

        // Добавляем x-default
        const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${path || "/"}"/>`;

        return `
  <url>
    <loc>${currentUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${path === "" ? "1.0" : "0.8"}</priority>
    ${alternates}${xDefault}
  </url>`;
      });
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>`.trim();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
