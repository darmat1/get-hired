"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/translations";
import { FileText, PlusCircle, FileCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import Logo from "../ui/icons/logo";

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <Link href="/" className="h-16 flex items-center justify-center">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          <li>
            <Link
              href="/resume/new"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                isActive("/resume/new")
                  ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <PlusCircle className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.create_resume")}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                isActive("/dashboard")
                  ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <FileText className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.dashboard")}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/cover-letter"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                isActive("/dashboard/cover-letter")
                  ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <FileCheck className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.cover_letter")}
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
