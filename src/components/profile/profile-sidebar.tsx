"use client";

import { LocalizedLink } from "@/components/ui/localized-link";
import { useTranslation } from "@/lib/translations";
import { User, Cpu } from "lucide-react";
import { usePathname } from "next/navigation";
import Logo from "../ui/icons/logo";
import { stripLocale } from "@/lib/i18n-config";

export function ProfileSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const isActive = (path: string) => stripLocale(pathname || "") === path;

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-full flex flex-col">
      <div className="px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
        <LocalizedLink
          href="/"
          className="h-16 flex items-center justify-center"
        >
          <Logo />
        </LocalizedLink>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          <li>
            <LocalizedLink
              href="/dashboard/profile"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group no-underline hover:no-underline ${
                isActive("/dashboard/profile")
                  ? "bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <User className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("profile.title")}
            </LocalizedLink>
          </li>
          <li>
            <LocalizedLink
              href="/dashboard/profile/ai"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group no-underline hover:no-underline ${
                isActive("/dashboard/profile/ai")
                  ? "bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <Cpu className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("ai_settings.title")}
            </LocalizedLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
