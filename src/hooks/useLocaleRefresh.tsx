"use client";

import { useEffect } from "react";

// Hook that triggers a callback whenever the UI locale changes via language switch
export function useLocaleRefresh(onRefresh: () => void | Promise<void>) {
  useEffect(() => {
    const handler = () => {
      onRefresh();
    };
    window.addEventListener("localeChanged", handler as any);
    return () => window.removeEventListener("localeChanged", handler as any);
  }, [onRefresh]);
}
