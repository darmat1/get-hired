"use client";

import React from "react";
import Logo from "./icons/logo";
import { useTranslation } from "@/lib/translations";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-md transition-all duration-500 animate-in fade-in">
      <div className="relative flex flex-col items-center">
        {/* Animated Glow behind Logo */}
        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse" />

        <div className="relative animate-bounce-gentle">
          <Logo className="h-12 w-auto" />
        </div>

        <div className="mt-8 flex flex-col items-center space-y-2">
          <div className="flex space-x-1.5">
            <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" />
          </div>

          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse">
            {message || t("form.loading") || "Loading..."}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-gentle {
          0%,
          100% {
            transform: translateY(-5%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s infinite;
        }
      `}</style>
    </div>
  );
}
