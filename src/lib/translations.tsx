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

import { useRouter } from "next/navigation";

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: ReactNode;
  initialLanguage: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const router = useRouter();

  // Keep state in sync with server-provided prop
  useEffect(() => {
    setLanguageState(initialLanguage);
  }, [initialLanguage]);

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

    const fullPath = newPath + searchParams;

    document.cookie = `NEXT_LOCALE=${newLang}; Path=/; max-age=31536000; sameSite=lax`;

    // Update state immediately for fast feedback
    setLanguageState(newLang);

    // Use Next.js router for smooth transition
    router.push(fullPath);
    // On blog pages, force a full page refresh to ensure language-specific content is re-fetched
    // This helps when certain components rely on server-rendered localized data.
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/blog")) {
      window.location.reload();
    }
    // Notify parts of the UI to refresh any language-dependent data without full reload
    if (typeof window !== "undefined") {
      const event = new CustomEvent("localeChanged", {
        detail: { language: newLang },
      });
      window.dispatchEvent(event);
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    return translation ? translation[language] || translation["en"] : key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Cleanup stale language keys from localStorage
  useEffect(() => {
    const staleKeys = ["cv-maker-language", "selectedLanguage", "i18nextLng"];
    staleKeys.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
  }, []);

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
