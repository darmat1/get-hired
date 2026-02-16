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
