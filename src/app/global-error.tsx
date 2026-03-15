"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
        <div className="text-center max-w-xl px-8 py-12 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-900/20 text-red-400 mb-8 border border-red-900/30">
            <AlertCircle className="w-10 h-10" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            Critical System Error
          </h1>

          <p className="text-slate-400 mb-10 leading-relaxed">
            A critical error occurred that prevented the application from
            loading. Please try refreshing the page.
          </p>

          <button
            onClick={() => reset()}
            className="px-10 py-4 bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-full transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          {error.digest && (
            <p className="mt-8 text-xs text-slate-500 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
