"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/translations";

interface AiQuotaData {
  hasOwnKey: boolean;
  count: number;
  limit: number;
}

export const refreshAiQuota = () => {
  if (typeof window !== "undefined") {
    console.log("[AiQuotaRefresh] Dispatching ai-quota-updated event");
    // Use setTimeout to ensure it runs after any current state updates
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("ai-quota-updated"));
    }, 0);
  }
};

export function AiQuotaDisplay() {
  const { t } = useTranslation();
  const [data, setData] = useState<AiQuotaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuota = async (isReactive = false) => {
    try {
      // If reactive, wait a tiny bit to ensure DB update is committed and readable
      if (isReactive) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Add timestamp to bypass browser cache
      const response = await fetch(`/api/account/ai-quota?t=${Date.now()}`);
      if (response.ok) {
        const json = await response.json();
        setData(json);
        console.log("[AiQuotaDisplay] Quota refreshed:", json);
      }
    } catch (error) {
      console.error("Failed to fetch AI quota", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();

    const handleUpdate = () => {
      console.log("[AiQuotaDisplay] custom event received");
      fetchQuota(true);
    };

    window.addEventListener("ai-quota-updated", handleUpdate);
    return () => window.removeEventListener("ai-quota-updated", handleUpdate);
  }, []);

  if (isLoading || !data) return null;

  // Don't show quota if user has connected their own key
  if (data.hasOwnKey) return null;

  const isExhausted = data.count >= data.limit;

  return (
    <div 
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 cursor-help"
      title={t("ai_quota.reset_hint")}
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>
        {t("ai_quota.daily_label")}: {data.count}/{data.limit}
      </span>
    </div>
  );
}
