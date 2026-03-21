import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["uk", "ru"];

// === CORS for Chrome Extension ===
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return (
    origin.startsWith("chrome-extension://") ||
    origin === "http://localhost:3000"
  );
}

function withCorsHeaders(response: NextResponse, origin: string): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  return response;
}

// === Main proxy ===
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const origin = request.headers.get("origin");
  const isApi = pathname.startsWith("/api/");

  // Handle CORS preflight for API
  if (request.method === "OPTIONS" && isApi && isAllowedOrigin(origin)) {
    return withCorsHeaders(new NextResponse(null, { status: 204 }), origin!);
  }

  // Skip locale handling for static files, API, sitemap, robots
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    isApi ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  ) {
    const response = NextResponse.next();
    if (isApi && isAllowedOrigin(origin)) {
      return withCorsHeaders(response, origin!);
    }
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  // If path starts with a supported locale
  if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment)) {
    const locale = firstSegment;
    const internalPath = "/" + segments.slice(1).join("/");
    const url = new URL(internalPath + search, request.url);

    requestHeaders.set("x-locale", locale);

    const res = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });

    res.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      sameSite: "lax",
    });
    return res;
  }

  // Default language from cookie or "en"
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const initialLocale =
    cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)
      ? cookieLocale
      : "en";

  requestHeaders.set("x-locale", initialLocale);

  // Redirect root to locale path if cookie is set
  if (pathname === "/") {
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
      return NextResponse.redirect(
        new URL(`/${cookieLocale}${search}`, request.url),
      );
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
