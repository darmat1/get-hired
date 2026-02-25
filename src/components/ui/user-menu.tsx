"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { LocalizedLink } from "@/components/ui/localized-link";
import { LogOut, Settings, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import Image from "next/image";

interface UserMenuProps {
  userName: string;
  userEmail: string;
  userImage?: string;
  gravatarUrl: string;
  userRole?: string;
}

export function UserMenu({
  userName,
  userEmail,
  userImage,
  gravatarUrl,
  userRole,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useTranslation();

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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Image
          width={32}
          height={32}
          src={userImage || gravatarUrl}
          alt={userName || userEmail}
          className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline-block">
          {userName || userEmail}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {userName}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {userEmail}
            </p>
          </div>

          <LocalizedLink
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors no-underline hover:no-underline"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t("nav.dashboard")}
          </LocalizedLink>

          {userRole === "admin" && (
            <LocalizedLink
              href="/admin/blog"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors no-underline hover:no-underline"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </LocalizedLink>
          )}

          <LocalizedLink
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors no-underline hover:no-underline"
          >
            <Settings className="h-4 w-4" />
            {t("nav.profile")}
          </LocalizedLink>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <LogOut className="h-4 w-4" />
            {t("nav.sign_out")}
          </button>
        </div>
      )}
    </div>
  );
}
