"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { useTranslation } from "@/lib/translations";
import { RefreshCw, Home, AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    // Log the error to Sentry
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background blobs consistent with Hero */}
        <div className="absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 w-[600px] h-[300px] bg-red-400/5 dark:bg-red-900/10 rounded-[100%] blur-[100px] -z-10 animate-pulse"></div>

        <div className="text-center z-10 max-w-2xl px-6 py-12 rounded-3xl border border-red-100 dark:border-red-900/30 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-8 border border-red-100 dark:border-red-900/30 shadow-inner">
            <AlertCircle className="w-10 h-10" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            {t("error.500.title")}
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            {t("error.500.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto px-10 py-4 text-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              {t("error.retry")}
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-10 py-4 text-lg bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold rounded-full border border-slate-200 dark:border-white/10 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              {t("error.back_home")}
            </Link>
          </div>

          {error.digest && (
            <p className="mt-8 text-xs text-slate-400 dark:text-slate-500 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
