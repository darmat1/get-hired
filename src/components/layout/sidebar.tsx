"use client";

import { LocalizedLink } from "@/components/ui/localized-link";
import { useTranslation } from "@/lib/translations";
import { FileText, PlusCircle, FileCheck, Briefcase, Settings, Cpu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import Logo from "../ui/icons/logo";
import { stripLocale } from "@/lib/i18n-config";
import { TrustpilotWidget } from "@/components/promo/trustpilot-widget";
import { UserMenu } from "@/components/ui/user-menu";
import { useSession } from "@/lib/auth-client";
import { MD5 } from "crypto-js";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => stripLocale(pathname || "") === path;

  const emailHash = session?.user?.email
    ? MD5(session.user.email.toLowerCase().trim()).toString()
    : "";
  const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=mp`;

  return (
    <aside
      className={cn(
        "flex h-full min-h-full flex-col bg-warm-100 dark:bg-warm-900",
        className,
      )}
    >
      <div className="bg-warm-50 px-4 border-b border-warm-200 dark:border-warm-700 dark:bg-warm-900 flex-shrink-0">
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
                  ? "bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-500/20 dark:text-terracotta-400"
                  : "text-warm-600 hover:bg-warm-50 dark:text-warm-400 dark:hover:bg-warm-800/50"
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
                  ? "bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-500/20 dark:text-terracotta-400"
                  : "text-warm-600 hover:bg-warm-50 dark:text-warm-400 dark:hover:bg-warm-800/50"
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
                  ? "bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-500/20 dark:text-terracotta-400"
                  : "text-warm-600 hover:bg-warm-50 dark:text-warm-400 dark:hover:bg-warm-800/50"
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
                  ? "bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-500/20 dark:text-terracotta-400"
                  : "text-warm-600 hover:bg-warm-50 dark:text-warm-400 dark:hover:bg-warm-800/50"
              }`}
            >
              <FileCheck className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.cover_letter")}
            </LocalizedLink>
          </li>
          <li>
            <LocalizedLink
              href="/dashboard/my-cover-letters"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group no-underline hover:no-underline ${
                isActive("/dashboard/my-cover-letters")
                  ? "bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-500/20 dark:text-terracotta-400"
                  : "text-warm-600 hover:bg-warm-50 dark:text-warm-400 dark:hover:bg-warm-800/50"
              }`}
            >
              <FileText className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.my_cover_letters")}
            </LocalizedLink>
          </li>
          {mounted && session && ["superadmin", "admin"].includes((session.user as any)?.role?.toLowerCase()) && (
            <li>
              <LocalizedLink
                href="/dashboard/jobs"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group no-underline hover:no-underline ${
                  isActive("/dashboard/jobs")
                    ? "bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-500/20 dark:text-terracotta-400"
                    : "text-warm-600 hover:bg-warm-50 dark:text-warm-400 dark:hover:bg-warm-800/50"
                }`}
              >
                <Search className="mr-3 h-5 w-5 flex-shrink-0" />
                {t("nav.jobs")}
              </LocalizedLink>
            </li>
          )}
        </ul>
      </nav>
      <div className="py-4 space-y-4 mt-auto">

          <p className="px-4 text-[10px] text-center text-muted-foreground mb-2 uppercase tracking-wider font-bold">
            {t("dashboard.sidebar.review_prompt") || "Enjoying our service? Share your review!"}
          </p>
          <div className="px-2">
            <TrustpilotWidget />
          </div>
        
        {mounted && session && (
          <div className="px-4 pt-2 border-t border-warm-200 dark:border-warm-700">
            <UserMenu
              userName={session.user?.name || ""}
              userEmail={session.user?.email || ""}
              userImage={session.user?.image || undefined}
              gravatarUrl={gravatarUrl}
              userRole={(session.user as any)?.role}
              isExpanded={true}
              className="w-full"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
