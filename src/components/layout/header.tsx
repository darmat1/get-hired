"use client";

import { useSession, signOut } from "@/lib/auth-client";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useTranslation } from "@/lib/translations";
import Logo from "../ui/icons/logo";

import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { MD5 } from "crypto-js";

export function Header() {
  const { data: session, isPending } = useSession();
  const { t } = useTranslation();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  const emailHash = session?.user?.email
    ? MD5(session.user.email.toLowerCase().trim()).toString()
    : "";
  const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=mp`;

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {!isDashboard && (
              <Link
                href="/"
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                <Logo />
              </Link>
            )}
          </div>

          <nav className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSelector />
            </div>

            {isPending ? (
              <div className="h-8 w-32 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : session ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={session.user?.image || gravatarUrl}
                      alt={session.user?.name || "User"}
                      className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline-block">
                      {session.user?.name || session.user?.email}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      await signOut();
                      window.location.href = "/";
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t("nav.sign_out")}
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
              >
                {t("nav.sign_in")}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
