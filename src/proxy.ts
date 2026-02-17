import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["uk", "ru"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/api") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  // Создаем копию заголовков, чтобы добавить свой
  const requestHeaders = new Headers(request.headers);
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  // 3. Если в начале пути наш язык (uk или ru)
  if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment)) {
    const locale = firstSegment;
    const internalPath = "/" + segments.slice(1).join("/");
    const url = new URL(internalPath + search, request.url);

    // ВАЖНО: Устанавливаем заголовок локали для сервера
    requestHeaders.set("x-locale", locale);

    console.log(`✨ MATCH! Locale: ${locale}. Rewriting to: ${internalPath}`);

    const res = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });

    res.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      sameSite: "lax",
    });
    return res;
  }

  // 4. Логика для главной и дефолтного языка
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const initialLocale =
    cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)
      ? cookieLocale
      : "en";

  requestHeaders.set("x-locale", initialLocale); // Устанавливаем из куки или en

  if (pathname === "/") {
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
      return NextResponse.redirect(
        new URL(`/${cookieLocale}${search}`, request.url),
      );
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/:path*"],
};
