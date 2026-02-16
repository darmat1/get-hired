"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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

  const pathname = usePathname();
  const router = useRouter();
  const currentLanguage = languages.find((l) => l.code === language);

  function buildLocalizedPath(target: Language) {
    const stripped = pathname?.replace(/^\/(ua|ru)(?=\/|$)/, "") || "";
    const search = typeof window !== "undefined" ? window.location.search : "";
    if (target === "en") {
      return (stripped === "" ? "/" : stripped) + search;
    }
    const localePrefix = target;
    const base = stripped === "" ? "" : stripped;
    return `/${localePrefix}${base}${search}`;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
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
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20 min-w-[120px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  // navigate to localized path (SEO-friendly)
                  const targetPath = buildLocalizedPath(lang.code);
                  router.push(targetPath);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  language === lang.code
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300"
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
