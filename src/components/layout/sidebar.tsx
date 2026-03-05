"use client";

import { LocalizedLink } from "@/components/ui/localized-link";
import { useTranslation } from "@/lib/translations";
import { FileText, PlusCircle, FileCheck, Briefcase } from "lucide-react";
import { usePathname } from "next/navigation";
import Logo from "../ui/icons/logo";
import { stripLocale } from "@/lib/i18n-config";

export function Sidebar() {
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
          {/* <li>
            <LocalizedLink
              href="/resume/new"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                isActive("/resume/new")
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
              }`}
            >
              <PlusCircle className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.create_resume")}
            </LocalizedLink>
          </li> */}
          <li>
            <LocalizedLink
              href="/dashboard"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group no-underline hover:no-underline ${
                isActive("/dashboard")
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
              }`}
            >
              <Briefcase className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.my_experience")}
            </LocalizedLink>
          </li>
          <li>
            <LocalizedLink
              href="/dashboard/my-resumes"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group no-underline hover:no-underline ${
                isActive("/dashboard/my-resumes")
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
              }`}
            >
              <FileText className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.my_resumes")}
            </LocalizedLink>
          </li>
          <li>
            <LocalizedLink
              href="/dashboard/cover-letter"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group no-underline hover:no-underline ${
                isActive("/dashboard/cover-letter")
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
              }`}
            >
              <FileCheck className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.cover_letter")}
            </LocalizedLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
