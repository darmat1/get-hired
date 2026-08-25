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
import { useEffect, useState } from "react";
import { AiQuotaDisplay } from "@/components/ui/ai-quota-display";
import { ChromeExtensionLink } from "@/components/ui/chrome-extension-link";

export function Header() {
  const { data: session, isPending } = useSession();
  const { t } = useTranslation();
  const pathname = usePathname();
  const isApplicationPage = isAppRoute(pathname || "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const emailHash = session?.user?.email
    ? MD5(session.user.email.toLowerCase().trim()).toString()
    : "";
  const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=mp`;

  useEffect(() => {
    if (session) {
      console.log(session);
    }
  }, [session]);

  // Don't render session-dependent content until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 border-b border-warm-200 bg-warm-50/80 backdrop-blur-md dark:border-warm-700 dark:bg-warm-900/80">
        <div
          className={
            isApplicationPage
              ? "mx-auto px-8"
              : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          }
        >
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              {!isApplicationPage && (
                <LocalizedLink
                  href="/"
                  className="text-xl font-bold text-warm-900 dark:text-warm-50"
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
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-warm-200 bg-warm-50/80 backdrop-blur-md dark:border-warm-700 dark:bg-warm-900/80">
      <div
        className={
          isApplicationPage
            ? "mx-auto px-8"
            : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        }
      >
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            {!isApplicationPage && (
              <LocalizedLink
                href="/"
                className="text-xl font-bold text-warm-900 dark:text-warm-50"
                aria-label="GetHired Home"
              >
                <Logo />
              </LocalizedLink>
            )}
            {!isApplicationPage && (
              <nav className="hidden md:flex items-center gap-6">
                <LocalizedLink
                  href="/pricing"
                  className="text-sm font-medium text-warm-600 hover:text-warm-900 dark:text-warm-300 dark:hover:text-warm-50 transition-colors"
                >
                  {t("nav.pricing")}
                </LocalizedLink>
                <LocalizedLink
                  href="/blog"
                  className="text-sm font-medium text-warm-600 hover:text-warm-900 dark:text-warm-300 dark:hover:text-warm-50 transition-colors"
                >
                  {t("nav.blog")}
                </LocalizedLink>
                <LocalizedLink
                  href="/agents"
                  className="text-sm font-medium text-warm-600 hover:text-warm-900 dark:text-warm-300 dark:hover:text-warm-50 transition-colors"
                >
                  {t("nav.agents")}
                </LocalizedLink>
              </nav>
            )}
          </div>

          <nav className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSelector />
              {isApplicationPage && session && (
                <>
                  <ChromeExtensionLink />
                  <AiQuotaDisplay />
                </>
              )}
            </div>

            {!isApplicationPage && (
              <>
                {isPending ? (
                  <div className="h-8 w-32 animate-pulse bg-warm-200 dark:bg-warm-700 rounded"></div>
                ) : session ? (
                  <div className="flex items-center space-x-4">
                    <UserMenu
                      userName={session.user?.name || ""}
                      userEmail={session.user?.email || ""}
                      userImage={session.user?.image || undefined}
                      gravatarUrl={gravatarUrl}
                      userRole={(session.user as any)?.role}
                    />
                  </div>
                ) : (
                  <LocalizedLink
                    href="/auth/signin"
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md border border-warm-300 hover:bg-warm-50 dark:border-warm-600 dark:hover:bg-warm-800 transition-colors text-sm font-medium text-warm-700 dark:text-warm-200 no-underline hover:no-underline"
                  >
                    <LogIn className="h-4 w-4" />
                    {t("nav.sign_in")}
                  </LocalizedLink>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
