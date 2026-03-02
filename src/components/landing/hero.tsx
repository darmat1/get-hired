"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/translations";
import { ArrowRight, Linkedin, Sparkles } from "lucide-react";
import Image from "next/image";

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
      {/* Animated Background blobs (Soft pastels/glows) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 dark:bg-blue-600/20 rounded-[100%] blur-[120px] -z-10 animate-pulse"></div>

      <div className="relative z-10">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-300 text-sm font-semibold mb-8 shadow-sm">
          AI Resume & Cover Letter Generator
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-8">
          {t("landing.hero.title")}
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
          {t("landing.hero.subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signin"
            className="w-full sm:w-auto px-10 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {t("landing.hero.cta")} <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/auth/signin?method=linkedin"
            className="w-full sm:w-auto px-10 py-4 text-lg bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold rounded-full border border-slate-200 dark:border-white/10 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
          >
            <Linkedin className="w-5 h-5 text-[#0A66C2]" />
            {t("landing.hero.cta_secondary")}
          </Link>
        </div>
      </div>

      <div className="mt-20 relative mx-auto max-w-5xl">
        {/* Pseudo-Browser Window for Hero */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 transform transition hover:scale-[1.02] duration-700">
          <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/50">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          </div>
          <div className="p-2 sm:p-4 bg-slate-50 dark:bg-slate-900">
            <Image
              src="/dashboard-preview-s.jpg"
              alt="App screenshot"
              width={2432}
              height={1442}
              className="rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-800 w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
