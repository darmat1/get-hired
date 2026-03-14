"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { useTranslation } from "@/lib/translations";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background blobs consistent with Hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-slate-400/10 dark:bg-slate-500/10 rounded-[100%] blur-[100px] -z-10 animate-pulse"></div>

        <div className="text-center z-10 max-w-2xl px-6 py-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white mb-8 border border-slate-200 dark:border-slate-700 shadow-inner">
            <span className="text-3xl font-bold">404</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            {t("error.404.title")}
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            {t("error.404.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              {t("error.back_home")}
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold rounded-full border border-slate-200 dark:border-white/10 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
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
