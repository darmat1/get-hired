"use client";

import { useSession } from "@/lib/auth-client";
import { LocalizedLink } from "@/components/ui/localized-link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSelector } from "@/components/ui/language-selector";
import { UserMenu } from "@/components/ui/user-menu";
import { useTranslation } from "@/lib/translations";
import { isAppRoute } from "@/lib/i18n-config";
import Logo from "../ui/icons/logo";
import { usePathname } from "next/navigation";
import { MD5 } from "crypto-js";
import { LogIn } from "lucide-react";
import { useEffect } from "react";

export function Header() {
  const { data: session, isPending } = useSession();
  const { t } = useTranslation();
  const pathname = usePathname();
  const isApplicationPage = isAppRoute(pathname || "");

  const emailHash = session?.user?.email
    ? MD5(session.user.email.toLowerCase().trim()).toString()
    : "";
  const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=mp`;

  useEffect(() => {
    if (session) {
      console.log(session);
    }
  }, [session]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {!isApplicationPage && (
              <LocalizedLink
                href="/"
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                <Logo />
              </LocalizedLink>
            )}
          </div>

          <nav className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSelector />
            </div>

            {isPending ? (
              <div className="h-8 w-32 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : session ? (
              <UserMenu
                userName={session.user?.name || ""}
                userEmail={session.user?.email || ""}
                userImage={session.user?.image || undefined}
                gravatarUrl={gravatarUrl}
                userRole={(session.user as any)?.role}
              />
            ) : (
              <LocalizedLink
                href="/auth/signin"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200 no-underline hover:no-underline"
              >
                <LogIn className="h-4 w-4" />
                {t("nav.sign_in")}
              </LocalizedLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
