"use client";

import { useEffect, useState } from "react";
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
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Show only on app-related routes (dashboard, resume, admin)
  const isAppPage = isAppRoute(pathname || "");
  const isSettingsPage = pathname?.includes("/profile/ai");

  // Fetch keys and quota
  const fetchKeys = async () => {
    if (!session?.user) return;
    try {
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

  // Timer logic for quota reset (00:00 UTC)
  useEffect(() => {
    if (!quotaExhausted) return;

    const calculateTime = () => {
      const now = new Date();
      // Time until next 00:00 UTC
      const nextReset = new Date();
      nextReset.setUTCHours(24, 0, 0, 0);
      
      const diffMs = nextReset.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      const hUnit = t("ai.hours") || "h";
      const mUnit = t("ai.minutes") || "m";
      
      return `[ ${hours}${hUnit} ${minutes}${mUnit} ]`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 30000); // update every 30s
    return () => clearInterval(interval);
  }, [quotaExhausted, t]);

  if (
    !session?.user || 
    hasKeys === true || 
    hasKeys === null || 
    !isAppPage || 
    isSettingsPage
  ) {
    return null;
  }

  const exhaustedDesc = t("ai_warning.quota_exhausted_desc") || "Your balance will automatically refill in {timer}. Need more right now? Connect your personal Groq key in 1 minute — it's absolutely free!";
  const formattedDesc = exhaustedDesc.replace("{timer}", timeLeft);

  return (
    <div className="relative z-[60] animate-in slide-in-from-top-full duration-300">
      <div className="bg-amber-600 border-amber-700 text-white shadow-lg px-4 py-3 border-b transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="bg-amber-800 p-2 rounded-full flex-shrink-0 hidden sm:block">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold leading-tight mb-0.5">
                {quotaExhausted 
                  ? (t("ai_warning.quota_exhausted_title") || "⏳ AI Quota Exhausted for Today!")
                  : (t("ai_warning.available_title") || "AI Configuration Required")}
              </p>
              <p className="text-xs sm:text-sm opacity-95 leading-snug max-w-2xl">
                {quotaExhausted
                  ? formattedDesc
                  : (t("ai_warning.description") || "To use AI features without daily limits, please connect at least one AI provider.")}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 items-center">
            <Link
              href="/dashboard/profile/ai"
              className="w-full sm:w-auto text-xs sm:text-sm px-4 py-2 rounded-md font-bold transition-transform hover:scale-105 bg-white text-amber-600 shadow-md"
            >
              {quotaExhausted 
                ? (t("ai_warning.setup_link_free") || "Connect Your Key (Free)")
                : (t("ai_warning.setup_link") || "Setup Keys")}
            </Link>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-xs sm:text-sm px-4 py-2 rounded-md font-medium transition-colors border border-white/40 text-white hover:bg-white/10"
            >
              {t("ai_warning.get_groq") || "Get Free Groq Key"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
