"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/translations";
import { User, Cpu } from "lucide-react";
import { usePathname } from "next/navigation";
import Logo from "../ui/icons/logo";

export function ProfileSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <Link href="/" className="h-16 flex items-center justify-center">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          <li>
            <Link
              href="/dashboard/profile"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                isActive("/dashboard/profile")
                  ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <User className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("profile.title")}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/profile/ai"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                isActive("/dashboard/profile/ai")
                  ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <Cpu className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("ai_settings.title")}
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
