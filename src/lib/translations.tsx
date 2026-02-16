"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react"; // Added useState
import { usePathname, useRouter } from "next/navigation";
import { translations, Language, getT } from "@/lib/translations-data";
// ^ Убедитесь, что путь к данным правильный

export type { Language };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Helper function to determine language from path
const getLanguageFromPath = (path: string): Language => {
  if (!path) return "en";
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 0) {
    if (segments[0] === "uk") return "uk";
    if (segments[0] === "ru") return "ru";
  }
  return "en";
};

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage: Language; // Accept initialLanguage prop
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Use initialLanguage from props as the initial currentLanguage
  const [currentLanguage, setCurrentLanguage] = useState<Language>(initialLanguage);

  // 2. Функция переключения языка (чистая логика URL)
  const setLanguage = (newLang: Language) => {
    if (newLang === currentLanguage) return;

    const path = pathname || "/";
    const segments = path.split("/").filter(Boolean);

    // Если текущий URL начинается с языка, убираем его, чтобы получить чистый путь
    if (segments.length > 0 && (segments[0] === "uk" || segments[0] === "ru")) {
      segments.shift();
    }

    const cleanPath = "/" + segments.join("/"); // Например "/dashboard" или "/"

    // Формируем новый путь
    let newPath;
    if (newLang === "en") {
      newPath = cleanPath; // Английский = путь без префикса
    } else {
      newPath = `/${newLang}${cleanPath === "/" ? "" : cleanPath}`; // /uk/dashboard
    }

    // Сохраняем куку для Middleware и обновляем localStorage
    localStorage.setItem("cv-maker-language", newLang);
    document.cookie = `NEXT_LOCALE=${newLang}; Path=/; max-age=${31536000}; samesite=Lax`;

    // Update the state variable
    setCurrentLanguage(newLang);

    // Переходим
    router.push(newPath);
  };

  // 3. Получаем функцию перевода
  const t = (key: string): string => {
    const getter = getT(currentLanguage);
    return getter(key);
  };

  // 4. Синхронизация кук при навигации (чтобы сервер знал текущий язык)
  useEffect(() => {
    localStorage.setItem("cv-maker-language", currentLanguage);
    document.documentElement.lang = currentLanguage; // Simplified
    document.cookie = `NEXT_LOCALE=${currentLanguage}; Path=/; max-age=${31536000}; samesite=Lax`;
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider
      value={{ language: currentLanguage, setLanguage, t }}
    >
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
