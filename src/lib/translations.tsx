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
  const [language] = useState<Language>(initialLanguage);

  const setLanguage = (newLang: Language) => {
    const currentPath = window.location.pathname;
    const searchParams = window.location.search;

    const segments = currentPath.split("/").filter(Boolean);

    const localesToClean = ["uk", "ru", "en"];

    while (
      segments.length > 0 &&
      localesToClean.includes(segments[0].toLowerCase())
    ) {
      segments.shift();
    }

    const cleanPath = segments.join("/");

    let newPath = "";
    if (newLang === "en") {
      newPath = cleanPath ? `/${cleanPath}` : "/";
    } else {
      newPath = cleanPath ? `/${newLang}/${cleanPath}` : `/${newLang}`;
    }

    document.cookie = `NEXT_LOCALE=${newLang}; Path=/; max-age=31536000; sameSite=lax`;
    localStorage.setItem("cv-maker-language", newLang);

    window.location.href = newPath + searchParams;
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
