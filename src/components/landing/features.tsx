"use client";

import { useTranslation } from "@/lib/translations";
import { CheckCircle2, FileText } from "lucide-react";
import Image from "next/image";

export function Features() {
  const { t } = useTranslation();

  const benefits = [
    t("landing.features.cover_letter.item1"),
    t("landing.features.cover_letter.item2"),
    t("landing.features.cover_letter.item3"),
    t("landing.features.cover_letter.item4"),
  ];

  return (
    <section className="overflow-hidden bg-slate-50 dark:bg-slate-900/50 py-24 sm:py-32 relative">
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-slate-300/20 dark:bg-slate-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 items-center">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 text-sm font-semibold mb-6 flex-wrap">
                <FileText className="w-4 h-4" />
                Killer Feature
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl mb-6 leading-tight">
                {t("landing.features.cover_letter.title")}
              </h2>
              <p className="text-lg leading-8 text-slate-600 dark:text-slate-400 mb-10">
                {t("landing.features.cover_letter.desc")}
              </p>

              <ul
                role="list"
                className="space-y-6 text-slate-700 dark:text-slate-300 font-medium"
              >
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex gap-x-4 items-start group">
                    <div className="flex-none p-1 rounded-full bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 group-hover:scale-110 group-hover:bg-slate-600 group-hover:text-white transition-all">
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="leading-snug pt-0.5">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-center lg:justify-start lg:order-last mt-10 lg:mt-0 w-full">
            <div className="relative w-full rounded-2xl p-2 bg-gradient-to-br from-slate-200 to-sky-200 dark:from-slate-900/40 dark:to-sky-900/40 shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="overflow-hidden rounded-xl border border-white/50 dark:border-slate-700 bg-white dark:bg-slate-900 w-full">
                <Image
                  src="/cover-letter1.jpg"
                  alt="AI Generated Cover Letter"
                  width={598}
                  height={336}
                  className="w-full shadow-sm opacity-90 object-cover object-left-top h-[300px] sm:h-[400px] lg:h-[550px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
