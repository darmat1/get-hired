"use client";

import { useTranslation } from "@/lib/translations";
import { Database, BrainCircuit, ScanSearch } from "lucide-react";

export function Solution() {
  const { t } = useTranslation();

  const features = [
    {
      name: t("landing.solution.step1.title"),
      description: t("landing.solution.step1.desc"),
      icon: Database,
    },
    {
      name: t("landing.solution.step2.title"),
      description: t("landing.solution.step2.desc"),
      icon: BrainCircuit,
    },
    {
      name: t("landing.solution.step3.title"),
      description: t("landing.solution.step3.desc"),
      icon: ScanSearch,
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-200/30 dark:bg-sky-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-sm font-semibold mb-6">
            Future of Resumes
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            {t("landing.solution.title")}
          </h2>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative group bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/60 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm text-sky-500 border border-slate-100 dark:border-slate-700 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                  <feature.icon className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.name}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
