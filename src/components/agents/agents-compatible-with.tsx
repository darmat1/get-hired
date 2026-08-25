"use client";

import { useTranslation } from "@/lib/translations";
import { Badge } from "@/components/ui/badge";

export function AgentsCompatibleWith() {
  const { t } = useTranslation();

  return (
    <section className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl mb-6">
          {t("agents.compatible.title")}
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
          {t("agents.compatible.subtitle")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 px-4 py-2 text-sm">
            Claude
          </Badge>
          <Badge className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 px-4 py-2 text-sm">
            ChatGPT
          </Badge>
          <Badge className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 px-4 py-2 text-sm">
            {t("agents.compatible.other")}
          </Badge>
        </div>
      </div>
    </section>
  );
}
