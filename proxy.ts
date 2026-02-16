import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Игнорируем системные файлы
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Легаси фикс: Если кто-то зашел на /ua, кидаем на /uk
  if (pathname.startsWith("/ua/") || pathname === "/ua") {
    const newPath = pathname.replace(/^\/ua/, "/uk");
    return NextResponse.redirect(new URL(`${newPath}${search}`, request.url));
  }

  // 3. Обработка локалей (uk, ru) - REWRITE (Подмена контента без смены URL)
  const match = pathname.match(/^\/(uk|ru)(?:\/|$)/i);
  if (match) {
    const locale = match[1].toLowerCase();

    // Убираем префикс для внутренней маршрутизации Next.js
    const stripped = pathname.replace(/^\/(uk|ru)/i, "") || "/";
    const destination = `${stripped}${search}`;

    const res = NextResponse.rewrite(new URL(destination, request.url));

    // Обновляем куку
    res.cookies.set("NEXT_LOCALE", locale, { path: "/", maxAge: 31536000 });
    return res;
  }

  // 4. Логика для корня (Английский по умолчанию)

  // ВНИМАНИЕ: Если здесь возникал цикл, значит браузер конфликтовал с этой частью.
  // Сейчас мы проверяем куки, но НЕ делаем редирект, если мы уже на нужном языке (в данном случае на английском/корне).

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;

  // Если пользователь на английском (корень), а кука говорит 'uk' или 'ru'
  if (cookieLocale && (cookieLocale === "uk" || cookieLocale === "ru")) {
    // Чтобы избежать цикла, мы редиректим ТОЛЬКО если запрос пришел на корень "/"
    // Для глубоких ссылок типа /dashboard пока отключим авто-редирект, чтобы проверить работоспособность.
    if (pathname === "/") {
      return NextResponse.redirect(
        new URL(`/${cookieLocale}${search}`, request.url),
      );
    }
  }

  // Если кук нет, проверяем язык браузера (только для главной страницы)
  if (!cookieLocale && pathname === "/") {
    const accept = request.headers.get("accept-language") || "";
    if (accept.includes("uk") || accept.includes("ua")) {
      const res = NextResponse.redirect(new URL(`/uk${search}`, request.url));
      res.cookies.set("NEXT_LOCALE", "uk", { path: "/", maxAge: 31536000 });
      return res;
    }
    if (accept.includes("ru")) {
      const res = NextResponse.redirect(new URL(`/ru${search}`, request.url));
      res.cookies.set("NEXT_LOCALE", "ru", { path: "/", maxAge: 31536000 });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
