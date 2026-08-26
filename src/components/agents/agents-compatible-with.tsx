"use client";

import { useTranslation } from "@/lib/translations";
import { Badge } from "@/components/ui/badge";

export function AgentsCompatibleWith() {
  const { t } = useTranslation();

  return (
    <section className="font-body py-24 sm:py-32 bg-warm-50 dark:bg-warm-900/50">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-warm-900 dark:text-warm-50 sm:text-5xl mb-6">
          {t("agents.compatible.title")}
        </h2>
        <p className="text-lg text-warm-600 dark:text-warm-400 leading-relaxed mb-10">
          {t("agents.compatible.subtitle")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge className="bg-terracotta-50 dark:bg-terracotta-900/30 text-terracotta-700 dark:text-terracotta-300 border-terracotta-200 dark:border-terracotta-800 px-4 py-2 text-sm">
            Claude
          </Badge>
          <Badge className="bg-terracotta-50 dark:bg-terracotta-900/30 text-terracotta-700 dark:text-terracotta-300 border-terracotta-200 dark:border-terracotta-800 px-4 py-2 text-sm">
            ChatGPT
          </Badge>
          <Badge className="bg-warm-50 dark:bg-warm-800 text-warm-600 dark:text-warm-400 border-warm-200 dark:border-warm-700 px-4 py-2 text-sm">
            {t("agents.compatible.other")}
          </Badge>
        </div>
      </div>
    </section>
  );
}
