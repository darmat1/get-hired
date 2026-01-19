"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "@/lib/translations";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const applyTheme = React.useCallback(
    (newTheme: "light" | "dark" | "system") => {
      if (typeof window === "undefined") return;
      const root = document.documentElement;
      const body = document.body;

      root.classList.remove("light", "dark");
      body.classList.remove("light", "dark");

      if (newTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
        body.classList.add(systemTheme);
      } else {
        root.classList.add(newTheme);
        body.classList.add(newTheme);
      }

      void root.offsetWidth;
    },
    [],
  );

  useEffect(() => {
    const saved = localStorage.getItem("cv-maker-theme") as
      | "light"
      | "dark"
      | "system";
    if (saved) {
      if (saved !== theme) {
        // eslint-disable-next-line
        setTheme(saved);
      }
      applyTheme(saved);
    } else {
      applyTheme("system");
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleThemeChange);
    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, [theme, applyTheme]);

  const toggleTheme = () => {
    let currentTheme = theme;
    if (currentTheme === "system") {
      currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    const nextTheme = currentTheme === "light" ? "dark" : "light";

    setTheme(nextTheme);
    localStorage.setItem("cv-maker-theme", nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors w-9 py-1.5 relative ${className}`}
      title={t("theme.toggle")}
      suppressHydrationWarning
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{t("theme.toggle")}</span>
    </button>
  );
}
