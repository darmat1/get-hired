"use client";

import { useEffect, useState } from "react";
import { useLocaleRefresh } from "@/hooks/useLocaleRefresh";
import { useSession } from "@/lib/auth-client";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/translations";
import { isAppRoute } from "@/lib/i18n-config";

export function AIKeyWarning() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [hasKeys, setHasKeys] = useState<boolean | null>(null);
  const [quotaExhausted, setQuotaExhausted] = useState<boolean>(false);

  // Show only on app-related routes (dashboard, resume, admin)
  const isAppPage = isAppRoute(pathname || "");
  const isSettingsPage = pathname?.includes("/profile/ai");

  // Fetch keys and refresh on locale changes as well
  const fetchKeys = async () => {
    if (!session?.user) return;
    try {
      // Check both keys and quota
      const [keysRes, quotaRes] = await Promise.all([
        fetch("/api/account/ai-keys"),
        fetch("/api/account/ai-quota")
      ]);
      
      const keysData = await keysRes.json();
      const quotaData = await quotaRes.json();
      
      const hasPersonalKeys = keysData.connectedProviders && keysData.connectedProviders.length > 0;
      setHasKeys(hasPersonalKeys);
      setQuotaExhausted(quotaData.count >= quotaData.limit);
      
    } catch (err) {
      console.error("Failed to check keys/quota:", err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [session, pathname]);

  useEffect(() => {
    const handleUpdate = () => fetchKeys();
    window.addEventListener("ai-quota-updated", handleUpdate);
    return () => window.removeEventListener("ai-quota-updated", handleUpdate);
  }, []);

  if (
    !session?.user || 
    hasKeys === true || 
    hasKeys === null || 
    !isAppPage || 
    isSettingsPage
  ) {
    return null;
  }

  return (
    <div className="relative z-[60] animate-in slide-in-from-top-full duration-300">
      <div className="bg-amber-600 border-amber-700 text-white shadow-lg px-4 py-2 border-b transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="bg-amber-800 p-1.5 rounded-full flex-shrink-0 hidden sm:block">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">
                {quotaExhausted 
                  ? (t("ai_warning.quota_exhausted_title") || "AI Quota Exhausted")
                  : (t("ai_warning.title") || "AI Configuration Required")}
              </p>
              <p className="text-xs opacity-90 leading-tight">
                {quotaExhausted
                  ? (t("ai_warning.quota_exhausted_desc") || "You have used all 10 free daily AI generations. Please connect your own API key to continue.")
                  : (t("ai_warning.description") || "To use AI features without daily limits, please connect at least one AI provider.")}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/dashboard/profile/ai"
              className="text-[10px] sm:text-xs px-3 py-1.5 rounded-md font-bold transition-colors bg-white text-amber-600 hover:bg-amber-50"
            >
              {t("ai_warning.setup_link") || "Setup Keys"}
            </Link>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] sm:text-xs px-3 py-1.5 rounded-md font-bold transition-colors border border-white/40 text-white hover:bg-white/10"
            >
              {t("ai_warning.get_groq") || "Get Free Groq Key"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
