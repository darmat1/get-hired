"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/translations";

export function AIKeyWarning() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [hasKeys, setHasKeys] = useState<boolean | null>(null);

  // Don't show on profile pages where user adds keys
  const isProfilePage = pathname?.startsWith("/dashboard/profile");

  useEffect(() => {
    if (!session?.user) return;

    const checkKeys = async () => {
      try {
        const res = await fetch("/api/account/ai-keys");
        const data = await res.json();
        if (data.connectedProviders && data.connectedProviders.length > 0) {
          setHasKeys(true);
        } else {
          setHasKeys(false);
        }
      } catch (err) {
        console.error("[AIKeyWarning] Failed to check keys:", err);
      }
    };

    checkKeys();
  }, [session, pathname]); // Re-check on path change in case user added key

  if (!session?.user || hasKeys === true || hasKeys === null || isProfilePage) {
    return null;
  }

  return (
    <div className="relative z-[60] animate-in slide-in-from-top-full duration-300">
      <div className="bg-amber-900 text-amber-50 shadow-lg px-4 py-2.5 border-b border-amber-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="bg-amber-800 p-1.5 rounded-full flex-shrink-0 hidden sm:block">
              <AlertTriangle className="h-4 w-4 text-amber-200" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-white">
                {t("ai_warning.title") || "AI Configuration Required"}
              </p>
              <p className="text-xs text-amber-100/90 leading-tight">
                {t("ai_warning.description") ||
                  "To use AI features, please connect at least one AI provider. Groq offers free models for testing."}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/dashboard/profile/ai"
              className="text-[10px] sm:text-xs bg-amber-100 text-amber-900 px-3 py-1.5 rounded-md font-bold transition-colors hover:bg-white"
            >
              {t("ai_warning.setup_link") || "Setup AI Keys"}
            </Link>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] sm:text-xs bg-amber-800 text-white border border-amber-700 px-3 py-1.5 rounded-md font-bold hover:bg-amber-700/50 transition-colors"
            >
              {t("ai_warning.get_groq") || "Get Free Groq Key"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
