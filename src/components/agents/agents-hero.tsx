"use client";

import { useTranslation } from "@/lib/translations";
import { LocalizedLink } from "@/components/ui/localized-link";
import { ArrowRight } from "lucide-react";

export function AgentsHero() {
  const { t } = useTranslation();

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-slate-400/10 dark:bg-slate-500/10 rounded-[100%] blur-[120px] -z-10" />

      <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 text-sm font-semibold mb-8 shadow-sm">
        {t("agents.hero.badge")}
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-8">
        {t("agents.hero.title")}
      </h1>

      <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
        {t("agents.hero.subtitle")}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <LocalizedLink
          href="/auth/signin"
          className="w-full sm:w-auto px-10 py-4 text-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          {t("agents.hero.cta")} <ArrowRight className="w-5 h-5" />
        </LocalizedLink>
        <a
          href="#how-it-works"
          className="w-full sm:w-auto px-10 py-4 text-lg bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold rounded-full border border-slate-200 dark:border-white/10 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
        >
          {t("agents.hero.cta_secondary")}
        </a>
      </div>
    </section>
  );
}
