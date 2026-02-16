export type Locale = "en" | "uk" | "ru";

export const SUPPORTED_LOCALES: Locale[] = ["en", "uk", "ru"];

// Minimal server-side translations used for metadata, sitemap and layout
const serverTranslations: Record<string, Record<string, string>> = {
  "page.home.title": {
    en: "GetHired - Create Professional Resumes",
    uk: "GetHired - Створення професійних резюме",
    ru: "GetHired - Создание профессиональных резюме",
  },
  "page.home.description": {
    en: "Create professional resumes with LinkedIn data integration and AI recommendations",
    uk: "Створюйте професійні резюме з даними з LinkedIn та AI‑рекомендаціями",
    ru: "Создавайте профессиональные резюме с данными из LinkedIn и AI‑рекомендациями",
  },
  "ai.title": {
    en: "AI Resume Analysis",
    uk: "AI Аналіз резюме",
    ru: "AI Анализ резюме",
  },
  "ai.description": {
    en: "Use artificial intelligence to improve your resume",
    uk: "Використовуйте штучний інтелект для покращення вашого резюме",
    ru: "Используйте искусственный интеллект для улучшения вашего резюме",
  },
};

export function getT(locale: Locale = "en") {
  const lookup = locale; // allow ua -> uk mapping where required
  return (key: string) => {
    const entry = serverTranslations[key];
    if (!entry) return key;
    // serverTranslations uses ua/uk keys consistently where applicable
    return (entry as any)[locale] || (entry as any)[lookup] || entry.en || key;
  };
}

export function localeFromPath(pathname: string | undefined): Locale {
  if (!pathname) return "en";
  if (pathname.startsWith("/uk")) return "uk";
  if (pathname.startsWith("/ru")) return "ru";
  return "en";
}
