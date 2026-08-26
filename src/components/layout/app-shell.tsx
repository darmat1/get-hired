"use client";

import { ReactNode, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  sidebar: ReactNode;
  mobileTitle?: string;
  contentClassName?: string;
}

export function AppShell({
  children,
  sidebar,
  mobileTitle = "Menu",
  contentClassName,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-warm-50 text-warm-900 dark:bg-warm-950 dark:text-warm-50">
      <div className="flex min-h-screen">
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <div className="sticky top-0 h-screen overflow-hidden border-r border-warm-200 bg-warm-100 dark:border-warm-800 dark:bg-warm-900">
            {sidebar}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-[60] border-b border-warm-200 bg-warm-100/95 backdrop-blur dark:border-warm-800 dark:bg-warm-900/95 lg:hidden">
            <div className="flex h-14 items-center justify-between px-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Open navigation"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <span className="truncate text-sm font-medium">{mobileTitle}</span>
              <div className="w-10" />
            </div>
          </div>

          <Header />

          <main
            className={cn(
              "flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8",
              contentClassName,
            )}
          >
            {children}
          </main>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[70] lg:hidden",
          isSidebarOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-warm-950/50 transition-opacity",
            isSidebarOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setIsSidebarOpen(false)}
        />

        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col border-r border-warm-200 bg-warm-100 shadow-2xl transition-transform dark:border-warm-800 dark:bg-warm-900",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-warm-200 px-4 dark:border-warm-800">
            <span className="text-sm font-medium">{mobileTitle}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close navigation"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto"
            onClick={() => setIsSidebarOpen(false)}
          >
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  );
}
