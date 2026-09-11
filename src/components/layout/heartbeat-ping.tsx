"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";

const HEARTBEAT_INTERVAL_MS = 60 * 1000;

export function HeartbeatPing() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    const ping = () => {
      if (document.visibilityState === "visible") {
        fetch("/api/heartbeat", { method: "POST" }).catch(() => {});
      }
    };

    ping();
    const interval = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", ping);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", ping);
    };
  }, [session]);

  return null;
}
