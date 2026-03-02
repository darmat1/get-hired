"use client";

import { useTranslation } from "@/lib/translations";
import { AlertCircle, Clock, FileWarning } from "lucide-react";

export function Problem() {
  const { t } = useTranslation();

  const problems = [
    {
      name: t("landing.problem.1"),
      icon: FileWarning,
    },
    {
      name: t("landing.problem.2"),
      icon: Clock,
    },
    {
      name: t("landing.problem.3"),
      icon: AlertCircle,
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            {t("landing.problem.title")}
          </h2>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="relative group bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:border-red-500/30 transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-sm">
                    <problem.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    {problem.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
