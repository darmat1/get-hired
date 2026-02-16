import type { Language } from "@/lib/translations";

export const locales: Language[] = ["en", "uk", "ru"];
export const defaultLocale: Language = "en";

export function isValidLocale(locale: string): locale is Language {
  return locales.includes(locale as Language);
}

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function isAppRoute(pathname: string) {
  if (!pathname) return false;
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0]?.toLowerCase();
  const rest = locales.includes(first as Language)
    ? segments.slice(1)
    : segments;
  const appPath = rest[0];
  return appPath === "dashboard" || appPath === "resume";
}

export function stripLocale(pathname: string) {
  if (!pathname) return "/";
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0]?.toLowerCase();

  if (locales.includes(first as Language)) {
    const cleaned = "/" + segments.slice(1).join("/");
    return cleaned === "//" ? "/" : cleaned || "/";
  }
  const result = "/" + segments.join("/");
  return result === "//" ? "/" : result || "/";
}
