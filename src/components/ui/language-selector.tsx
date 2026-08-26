"use client";

import React, { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useTranslation, Language } from "@/lib/translations";

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = "" }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const languages: { code: Language; name: string }[] = [
    { code: "en", name: mounted ? t("language.english") : "English" },
    { code: "uk", name: mounted ? t("language.ukrainian") : "Ukrainian" },
    { code: "ru", name: mounted ? t("language.russian") : "Russian" },
  ];

  const currentLanguage = languages.find((l) => l.code === language);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-warm-300 hover:bg-warm-50 dark:border-warm-600 dark:hover:bg-warm-800 transition-colors"
        title={mounted ? t("language.title") : "Language"}
        suppressHydrationWarning
      >
        <Globe className="h-5 w-5" />
        <span className="text-sm" suppressHydrationWarning>
          {mounted ? currentLanguage?.name : "..."}
        </span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-warm-100 dark:bg-warm-800 border border-warm-200 dark:border-warm-600 rounded-md shadow-lg z-20 min-w-[120px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors ${
                  language === lang.code
                    ? "bg-terracotta-50 dark:bg-terracotta-500/20 text-terracotta-700 dark:text-terracotta-400"
                    : "text-warm-700 dark:text-warm-300"
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
