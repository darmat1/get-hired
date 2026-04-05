import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell sidebar={<AdminSidebar />} mobileTitle="Admin">
      {children}
    </AppShell>
  );
}
