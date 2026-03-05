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
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 transition-colors"
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
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md shadow-lg z-20 min-w-[120px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                  language === lang.code
                    ? "bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400"
                    : "text-slate-700 dark:text-slate-300"
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
