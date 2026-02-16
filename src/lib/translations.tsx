"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { translations } from "./translations-data";

export type Language = "en" | "uk" | "ru";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: ReactNode;
  initialLanguage: Language;
}) {
  // Инициализируем стейт один раз. Благодаря заголовкам в лейауте,
  // значение на сервере и клиенте будет одинаковым.
  const [language] = useState<Language>(initialLanguage);

  const setLanguage = (newLang: Language) => {
    // В i18n с прокси лучше всего работает прямая смена URL через href
    const currentPath = window.location.pathname;
    const segments = currentPath.split("/").filter(Boolean);
    const locales = ["uk", "ru", "ua"];

    if (locales.includes(segments[0])) {
      segments.shift();
    }

    const cleanPath = "/" + segments.join("/");
    const newPath =
      newLang === "en"
        ? cleanPath
        : `/${newLang}${cleanPath === "/" ? "" : cleanPath}`;

    document.cookie = `NEXT_LOCALE=${newLang}; Path=/; max-age=31536000; sameSite=lax`;
    localStorage.setItem("cv-maker-language", newLang);

    window.location.href = newPath;
  };

  const t = (key: string): string => {
    const translation = translations[key];
    return translation ? translation[language] || translation["en"] : key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
