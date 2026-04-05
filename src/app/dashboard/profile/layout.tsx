"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { AppShell } from "@/components/layout/app-shell";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell sidebar={<Sidebar />} mobileTitle="Dashboard">
      {children}
    </AppShell>
  );
}
