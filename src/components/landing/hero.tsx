"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/translations";
import { ArrowRight, Sparkles } from "lucide-react";
import { LinkedinIcon } from "@/components/ui/icons/linkedin";
import Image from "next/image";

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="font-body relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
      {/* Animated Background blobs (Soft Slate/Neutral glows) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-warm-400/10 dark:bg-warm-500/10 rounded-[100%] blur-[120px] -z-10 animate-pulse"></div>

      <div className="relative z-10">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-warm-100 dark:bg-warm-800/50 border border-warm-200 dark:border-warm-700/50 text-warm-900 dark:text-warm-100 text-sm font-semibold mb-8 shadow-sm">
          AI Resume & Cover Letter Generator
        </div>

        <h1 className="font-heading text-5xl md:text-7xl font-extrabold text-warm-900 dark:text-warm-50 tracking-tight leading-tight mb-8">
          {t("landing.hero.title")}
        </h1>

        <p className="text-xl md:text-2xl text-warm-600 dark:text-warm-400 max-w-3xl mx-auto mb-12 leading-relaxed">
          {t("landing.hero.subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signin"
            className="w-full sm:w-auto px-10 py-4 text-lg bg-terracotta-500 hover:bg-terracotta-600 text-white dark:bg-terracotta-500 dark:hover:bg-terracotta-600 dark:text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {t("landing.hero.cta")} <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/auth/signin?method=linkedin"
            className="w-full sm:w-auto px-10 py-4 text-lg bg-warm-50 dark:bg-warm-50/5 hover:bg-warm-50 dark:hover:bg-warm-50/10 text-warm-700 dark:text-warm-50 font-bold rounded-full border border-warm-200 dark:border-warm-50/10 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
          >
            <LinkedinIcon className="w-5 h-5 fill-current stroke-current" />
            {t("landing.hero.cta_secondary")}
          </Link>
        </div>
      </div>

      <div className="mt-20 relative mx-auto max-w-5xl">
        {/* Pseudo-Browser Window for Hero */}
        <div className="rounded-2xl overflow-hidden border border-warm-200 dark:border-warm-800 shadow-2xl bg-warm-50 dark:bg-warm-900 transform transition hover:scale-[1.02] duration-700">
          <div className="bg-warm-100 dark:bg-warm-800/80 px-4 py-3 flex items-center gap-2 border-b border-warm-200 dark:border-warm-700/50">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          </div>
          <div className="p-2 sm:p-4 bg-warm-50 dark:bg-warm-900">
            <Image
              src="/dashboard-preview-s.jpg"
              alt="App screenshot"
              width={2432}
              height={1442}
              className="rounded-xl shadow-sm border border-warm-200/50 dark:border-warm-800 w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
