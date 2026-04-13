"use client";

import { Puzzle } from "lucide-react";
import { useTranslation } from "@/lib/translations";

const CHROME_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/gethiredwork-%E2%80%94-cover-lett/khdamklpipfmaeimaeeckfbfbihicimg";

export function ChromeExtensionLink() {
  const { t } = useTranslation();

  return (
    <a
      href={CHROME_EXTENSION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-600 transition-colors"
      title={t("chrome_extension.tooltip")}
    >
      <Puzzle className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{t("chrome_extension.install")}</span>
    </a>
  );
}
