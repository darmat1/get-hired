"use client";

import { useTranslation } from "@/lib/translations";
import { LocalizedLink } from "@/components/ui/localized-link";
import { ArrowRight } from "lucide-react";

export function AgentsTeaser() {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-8 py-10 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wider mb-3">
              {t("landing.agents_teaser.eyebrow")}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              {t("landing.agents_teaser.title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl">
              {t("landing.agents_teaser.subtitle")}
            </p>
          </div>
          <LocalizedLink
            href="/agents"
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 font-bold rounded-full transition-colors whitespace-nowrap"
          >
            {t("landing.agents_teaser.cta")} <ArrowRight className="w-4 h-4" />
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
