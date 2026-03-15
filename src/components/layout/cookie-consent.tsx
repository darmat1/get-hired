"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/translations";
import { Cookie, X } from "lucide-react";

export function CookieConsent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => {
        setShouldRender(true);
        // Small delay to trigger transition
        setTimeout(() => setIsVisible(true), 10);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
    setTimeout(() => setShouldRender(false), 500);
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-2xl transition-all duration-500 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 dark:bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-700/50">
        {/* Animated Background Accent */}
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm">
            <Cookie className="h-6 w-6" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              {t("cookie.settings")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("cookie.message")}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={handleAccept}
              className="relative overflow-hidden group px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95"
            >
              <span className="relative z-10">{t("cookie.accept")}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => setShouldRender(false), 500);
              }}
              className="p-2 mr-[-0.5rem] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
