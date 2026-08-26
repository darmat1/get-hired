"use client";

import { LocalizedLink } from "@/components/ui/localized-link";
import { useTranslation } from "@/lib/translations";
import { LayoutDashboard, FileText, Users, Briefcase } from "lucide-react";
import { usePathname } from "next/navigation";
import Logo from "../ui/icons/logo";
import { stripLocale } from "@/lib/i18n-config";
import { UserMenu } from "@/components/ui/user-menu";
import { useSession } from "@/lib/auth-client";
import { MD5 } from "crypto-js";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => stripLocale(pathname || "") === path;
  const userRole = (session?.user as any)?.role?.toLowerCase() || "user";

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
      <div className="px-4 border-b border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-900 flex-shrink-0">
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
              href="/dashboard"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-warm-600 hover:bg-warm-50 dark:text-warm-400 dark:hover:bg-warm-800/50 no-underline hover:no-underline mb-4 border border-warm-200 dark:border-warm-700"
            >
              <Briefcase className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.dashboard")}
            </LocalizedLink>
          </li>
          <li>
            <LocalizedLink
              href="/admin/blog"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group no-underline hover:no-underline ${
                isActive("/admin/blog")
                  ? "bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-500/20 dark:text-terracotta-400"
                  : "text-warm-600 hover:bg-warm-50 dark:text-warm-400 dark:hover:bg-warm-800/50"
              }`}
            >
              <FileText className="mr-3 h-5 w-5 flex-shrink-0" />
              Blog
            </LocalizedLink>
          </li>
          {isMounted && ["superadmin", "admin"].includes(userRole) && (
            <li>
              <LocalizedLink
                href="/admin/users"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group no-underline hover:no-underline ${
                  isActive("/admin/users")
                    ? "bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-500/20 dark:text-terracotta-400"
                    : "text-warm-600 hover:bg-warm-50 dark:text-warm-400 dark:hover:bg-warm-800/50"
                }`}
              >
                <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                Users
              </LocalizedLink>
            </li>
          )}
        </ul>
      </nav>
      <div className="py-4 mt-auto">
        {isMounted && session && (
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
