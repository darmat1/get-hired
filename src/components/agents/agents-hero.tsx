"use client";

import { useTranslation } from "@/lib/translations";
import { LocalizedLink } from "@/components/ui/localized-link";
import { ArrowRight } from "lucide-react";

export function AgentsHero() {
  const { t } = useTranslation();

  return (
    <section className="font-body relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-warm-400/10 dark:bg-warm-500/10 rounded-[100%] blur-[120px] -z-10" />

      <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-warm-100 dark:bg-warm-800/50 border border-warm-200 dark:border-warm-700/50 text-warm-900 dark:text-warm-100 text-sm font-semibold mb-8 shadow-sm">
        {t("agents.hero.badge")}
      </div>

      <h1 className="font-heading text-5xl md:text-7xl font-extrabold text-warm-900 dark:text-warm-50 tracking-tight leading-tight mb-8">
        {t("agents.hero.title")}
      </h1>

      <p className="text-xl md:text-2xl text-warm-600 dark:text-warm-400 max-w-3xl mx-auto mb-12 leading-relaxed">
        {t("agents.hero.subtitle")}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <LocalizedLink
          href="/auth/signin"
          className="w-full sm:w-auto px-10 py-4 text-lg bg-terracotta-500 hover:bg-terracotta-600 text-white dark:bg-terracotta-500 dark:hover:bg-terracotta-600 dark:text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          {t("agents.hero.cta")} <ArrowRight className="w-5 h-5" />
        </LocalizedLink>
        <a
          href="#how-it-works"
          className="w-full sm:w-auto px-10 py-4 text-lg bg-warm-50 dark:bg-warm-50/5 hover:bg-warm-50 dark:hover:bg-warm-50/10 text-warm-700 dark:text-warm-50 font-bold rounded-full border border-warm-200 dark:border-warm-50/10 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
        >
          {t("agents.hero.cta_secondary")}
        </a>
      </div>
    </section>
  );
}
