"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { useTranslation } from "@/lib/translations";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background blobs consistent with Hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-warm-400/10 dark:bg-warm-500/10 rounded-[100%] blur-[100px] -z-10 animate-pulse"></div>

        <div className="text-center z-10 max-w-2xl px-6 py-12 rounded-3xl border border-warm-200 dark:border-warm-800 bg-warm-50/50 dark:bg-warm-950/50 backdrop-blur-xl shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warm-100 dark:bg-warm-800 text-warm-900 dark:text-warm-50 mb-8 border border-warm-200 dark:border-warm-700 shadow-inner">
            <span className="font-heading text-3xl font-bold">404</span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-warm-900 dark:text-warm-50 tracking-tight mb-6">
            {t("error.404.title")}
          </h1>

          <p className="text-lg md:text-xl text-warm-600 dark:text-warm-400 mb-10 leading-relaxed">
            {t("error.404.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white dark:bg-terracotta-500 dark:hover:bg-terracotta-600 dark:text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              {t("error.back_home")}
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-8 py-3.5 bg-warm-50 dark:bg-warm-50/5 hover:bg-warm-100 dark:hover:bg-warm-50/10 text-warm-700 dark:text-warm-50 font-bold rounded-full border border-warm-200 dark:border-warm-50/10 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {t("form.back")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
