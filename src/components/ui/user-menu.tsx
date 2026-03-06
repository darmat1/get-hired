"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { LocalizedLink } from "@/components/ui/localized-link";
import { LogOut, Settings, LayoutDashboard, ShieldCheck, Cpu } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/i18n-config";
import Image from "next/image";

interface UserMenuProps {
  userName: string;
  userEmail: string;
  userImage?: string;
  gravatarUrl: string;
  userRole?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
  isExpanded?: boolean;
}

export function UserMenu({
  userName,
  userEmail,
  userImage,
  gravatarUrl,
  userRole,
  side = "bottom",
  align = "end",
  className = "",
  isExpanded = false,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (path: string) => stripLocale(pathname || "") === path;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const menuPositionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  if (isExpanded) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <div className="flex items-center gap-2 px-2 py-3">
          <Image
            width={32}
            height={32}
            src={userImage || gravatarUrl}
            alt={userName || userEmail}
            className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
              {userName || userEmail}
            </p>
            {userName && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {userEmail}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          {["superadmin", "admin", "publisher"].includes(userRole?.toLowerCase() || "") && (
            <LocalizedLink
              href="/admin/blog"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors no-underline hover:no-underline"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </LocalizedLink>
          )}

          <LocalizedLink
            href="/dashboard/profile/ai"
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors no-underline hover:no-underline ${
              isActive("/dashboard/profile/ai")
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Cpu className="h-4 w-4" />
            {t("ai_settings.title")}
          </LocalizedLink>

          <LocalizedLink
            href="/dashboard/profile"
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors no-underline hover:no-underline ${
              isActive("/dashboard/profile")
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Settings className="h-4 w-4" />
            {t("nav.profile")}
          </LocalizedLink>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
          >
            <LogOut className="h-4 w-4" />
            {t("nav.sign_out")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left"
      >
        <Image
          width={32}
          height={32}
          src={userImage || gravatarUrl}
          alt={userName || userEmail}
          className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0 hidden sm:block">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
            {userName || userEmail}
          </p>
          {userName && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {userEmail}
            </p>
          )}
        </div>
      </button>

      {isOpen && (
        <div className={`absolute ${menuPositionClasses[side]} ${alignClasses[align]} w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50`}>
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 sm:hidden">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {userName}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {userEmail}
            </p>
          </div>

          <LocalizedLink
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors no-underline hover:no-underline"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t("nav.dashboard")}
          </LocalizedLink>

          {["superadmin", "admin", "publisher"].includes(userRole?.toLowerCase() || "") && (
            <LocalizedLink
              href="/admin/blog"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors no-underline hover:no-underline"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </LocalizedLink>
          )}

          <LocalizedLink
            href="/dashboard/profile/ai"
            onClick={() => setIsOpen(false)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors no-underline hover:no-underline ${
              isActive("/dashboard/profile/ai")
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <Cpu className="h-4 w-4" />
            {t("ai_settings.title")}
          </LocalizedLink>

          <LocalizedLink
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors no-underline hover:no-underline ${
              isActive("/dashboard/profile")
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <Settings className="h-4 w-4" />
            {t("nav.profile")}
          </LocalizedLink>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
          >
            <LogOut className="h-4 w-4" />
            {t("nav.sign_out")}
          </button>
        </div>
      )}
    </div>
  );
}
