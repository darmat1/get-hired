"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/translations";

export function AIKeyWarning() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [hasKeys, setHasKeys] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(true);

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

  if (
    !session?.user ||
    hasKeys === true ||
    hasKeys === null ||
    !isVisible ||
    isProfilePage
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700/50 rounded-lg shadow-lg p-4 relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-3">
          <div className="bg-amber-100 dark:bg-amber-900/60 p-2 rounded-full h-fit flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              {t("ai_warning.title") || "AI Configuration Required"}
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200/90 mb-3">
              {t("ai_warning.description") ||
                "To use AI features, please connect at least one AI provider. Groq offers free models for testing."}
            </p>
            <div className="flex gap-2">
              <Link
                href="/dashboard/profile/ai"
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
                onClick={() => setIsVisible(false)}
              >
                {t("ai_warning.setup_link") || "Setup Keys"}
              </Link>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-white dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-100 px-3 py-1.5 rounded-md font-medium hover:bg-amber-50 dark:hover:bg-amber-800/50 transition-colors"
              >
                {t("ai_warning.get_groq") || "Get Free Groq Key"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
